import shutil
import sys
import json
import os
import re
import subprocess
import platform
from xml.etree import ElementTree as ET

# Para poder usar npx en windows y otros sistemas
npx_cmd = "npx"
if platform.system() == "Windows":
    npx_cmd = "npx.cmd"

# Validación de argumentos
if len(sys.argv) < 2:
        print("Uso: python setup_env.py <provider_name> [public|private]")
        sys.exit(1)

provider = sys.argv[1] if len(sys.argv) > 1 else "default"
print(f"\n🛠 Generando plantilla para proveedor: {provider}")
mode = sys.argv[2] if len(sys.argv) > 2 else "public"
print(f"🔐 Modo de la app: {mode}")
if mode not in ("public", "private"):
    print("❌ Segundo argumento inválido. Usa 'public' o 'private'")
    sys.exit(1)

# Paths dentro del proyecto
base_dir = os.path.dirname(os.path.abspath(__file__))
config_source = os.path.join(base_dir, f"./src/config/app/{provider}.json")
config_dest = os.path.join(base_dir, "./src/config/app.json")
theme_source = os.path.join(base_dir, f"./src/config/themes/{provider}.json")
theme_dest = os.path.join(base_dir, "src/config/theme.json")
logo_source = os.path.join(base_dir, f"assets/logos/logo-{provider}.png")
logo_dest = os.path.join(base_dir, "assets/logo.png")
env_path = os.path.join(base_dir, ".env")
global_vars_path = os.path.join(base_dir, "src/globalVariables.ts")

#Paths Android
strings_xml = os.path.join(base_dir, "android/app/src/main/res/values/strings.xml")
colors_xml = os.path.join(base_dir, "android/app/src/main/res/values/colors.xml")
launcher_xml = os.path.join(base_dir, "android/app/src/main/res/values/ic_launcher_background.xml")

#Paths iOS
plist_path = os.path.join(base_dir, "ios/testDoc/Info.plist")  # ⚠️ cambia "tuProyecto" por el nombre de tu carpeta ios

#Copiar el logo de la fuente al destino
try:
    shutil.copyfile(logo_source, logo_dest)
    print(f"✅ Logo copiado: {logo_source} → {logo_dest}")
except Exception as e:
    print(f"❌ Error copiando logo: {e}")

#Copiar el theme de la fuente al destino
try:
    shutil.copyfile(theme_source, theme_dest)
    print(f"✅ Tema copiado: {theme_source} → {theme_dest}")
except Exception as e:
    print(f"❌ Error copiando tema: {e}")

#Copiar la config de la fuente al destino
try:
    shutil.copyfile(config_source, config_dest)
    print(f"✅ Config copiado: {config_source} → {config_dest}")
except Exception as e:
    print(f"❌ Error copiando config: {e}")

# Modificar el app.json para actualizar el PackageName según los argumentos
try:
    with open(config_dest, "r", encoding="utf-8") as f:
        config = json.load(f)

    app_name = config.get("AppName")  # fallback por si no existe

    # Lógica para Chiapas y VFI
    if provider.lower() in ("chiapas", "vfi"):
        if mode == "public":
            app_name += " Público"
        elif mode == "private":
            app_name += " Privado"

    config["AppName"] = app_name

    new_package = f"com.{provider}{mode}"
    config["PackageName"] = new_package

    with open(config_dest, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    print(f"✅ app.json actualizado con PackageName: {new_package} y AppName: {app_name}")
except Exception as e:
    print(f"❌ Error actualizando app.json: {e}")
    sys.exit(1)

# Leer colores desde theme.json
theme_path = os.path.join(base_dir, "src/config/theme.json")
try:
    with open(theme_path, "r", encoding="utf-8") as f:
        theme = json.load(f)
        bootsplash_color = theme.get("bootsplash_background")
        launcher_color = theme.get("ic_launcher_background")

        # Quitar el "#" inicial si existe REFACTOR: CAUSO PROBLEMAS EN MACOS CON ANDROID STUDIO EMULATOR
    if bootsplash_color and bootsplash_color.startswith("#"):
        bootsplash_color = bootsplash_color[1:]
except Exception as e:
    print(f"❌ Error leyendo theme.json: {e}")
    bootsplash_color = None
    launcher_color = None

# Actualizar build.gradle
build_gradle_path = os.path.join(base_dir, "android/app/build.gradle")
try:
    with open(build_gradle_path, "r", encoding="utf-8") as f:
        gradle_content = f.read()

    gradle_content = re.sub(r'applicationId\s+"[^"]+"', f'applicationId "{new_package}"', gradle_content)
    gradle_content = re.sub(r'namespace\s+"[^"]+"', f'namespace "{new_package}"', gradle_content)

    with open(build_gradle_path, "w", encoding="utf-8") as f:
        f.write(gradle_content)

    print(f"✅ build.gradle actualizado:\n   - applicationId: {new_package}\n   - namespace: {new_package}")
except Exception as e:
    print(f"❌ Error actualizando build.gradle: {e}")

# === 1. Actualizar valores XML de color ===
def update_color_value(file_path, color_name, new_value):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        updated = False

        for color in root.findall("color"):
            if color.attrib.get("name") == color_name:
                color.text = new_value
                updated = True

        if updated:
            tree.write(file_path, encoding="utf-8", xml_declaration=True)
            print(f"✅ {color_name} actualizado en {os.path.basename(file_path)}")
        else:
            print(f"⚠️ {color_name} no encontrado en {os.path.basename(file_path)}")
    except Exception as e:
        print(f"❌ Error modificando {os.path.basename(file_path)}: {e}")

if bootsplash_color:
    update_color_value(colors_xml, "bootsplash_background", bootsplash_color) #REFACTOR, a lo mejor aqui se debe agregar el "#" para el color
else:
    print("⚠️ bootsplash_color no definido en theme.json")

if launcher_color:
    update_color_value(launcher_xml, "ic_launcher_background", launcher_color)
else:
    print("⚠️ ic_launcher_background no definido en theme.json")

# === 2. Actualizar app_name en strings.xml ===
def update_app_name(file_path, app_name_value):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        updated = False

        for string in root.findall("string"):
            if string.attrib.get("name") == "app_name":
                string.text = app_name_value
                updated = True
                break

        if updated:
            tree.write(file_path, encoding="utf-8", xml_declaration=True)
            print(f"✅ app_name actualizado en strings.xml → {app_name_value}")
        else:
            print("⚠️ app_name no encontrado en strings.xml")
    except Exception as e:
        print(f"❌ Error modificando strings.xml: {e}")

if app_name:
    update_app_name(strings_xml, app_name)
else:
    print("⚠️ AppName no definido en app.json")

# === 3. Mover carpeta Java ===
java_dir = os.path.join(base_dir, "android/app/src/main/java")

current_package_dir = None
for root, dirs, _ in os.walk(java_dir):
    if 'MainApplication.kt' in os.listdir(root):
        current_package_dir = root
        break

new_package_path = os.path.join(java_dir, *new_package.split("."))
if current_package_dir:
    old_package = os.path.relpath(current_package_dir, java_dir).replace(os.sep, ".")
    if old_package != new_package:
        try:
            os.makedirs(new_package_path, exist_ok=True)
            for filename in os.listdir(current_package_dir):
                shutil.move(
                    os.path.join(current_package_dir, filename),
                    os.path.join(new_package_path, filename)
                )
            if not os.listdir(current_package_dir):
                os.rmdir(current_package_dir)
            print(f"✅ Carpeta Java movida:\n   - de: {old_package}\n   - a: {new_package}")
        except Exception as e:
            print(f"❌ Error moviendo carpeta Java: {e}")
    else:
        print("ℹ️ El paquete Java ya está en la ruta correcta.")
else:
    print("❌ No se encontró MainApplication.kt para mover la carpeta Java.")
    sys.exit(1)

# === 4. Detectar paquete actual en MainApplication.kt ===
def detect_actual_package(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip().startswith('package '):
                    return line.strip().replace('package ', '').replace(';', '').strip()
    except Exception as e:
        print(f"❌ Error detectando paquete en {file_path}: {e}")
    return None

main_app_path = os.path.join(new_package_path, 'MainApplication.kt')
actual_package = detect_actual_package(main_app_path)

if not actual_package:
    print("❌ No se pudo detectar el paquete actual en MainApplication.kt")
    sys.exit(1)

print(f"\n📦 Paquete actual REAL detectado: {actual_package}")
print(f"📦 Paquete objetivo configurado: {new_package}")

if actual_package == new_package:
    print("ℹ️ El paquete ya está actualizado, no se necesitan cambios")
else:
    def update_package_declarations(root_dir, actual_pkg, new_pkg):
        print(f"\n🔄 Actualizando de {actual_pkg} a {new_pkg}...")
        files_updated = 0
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file.endswith(".kt") or file.endswith(".java"):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()

                        new_content = content.replace(f"package {actual_pkg}", f"package {new_pkg}")
                        new_content = new_content.replace(f"package {actual_pkg};", f"package {new_pkg};")
                        new_content = new_content.replace(f"import {actual_pkg}.", f"import {new_pkg}.")

                        if content != new_content:
                            with open(file_path, "w", encoding="utf-8") as f:
                                f.write(new_content)
                            print(f"✅ {file} actualizado")
                            print(f"   Antes: {[line for line in content.split('\n') if 'package ' in line][0]}")
                            print(f"   Ahora: {[line for line in new_content.split('\n') if 'package ' in line][0]}")
                            files_updated += 1
                        else:
                            print(f"ℹ️ {file} no requiere cambios")
                    except Exception as e:
                        print(f"❌ Error en {file}: {e}")
        return files_updated

    files_updated = update_package_declarations(new_package_path, actual_package, new_package)
    print(f"\n🎉 Total de archivos actualizados: {files_updated}")

def update_env_value(file_path, key, value):
    lines = []
    found = False

    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith(f"{key}="):
                    lines.append(f"{key}={value}\n")
                    found = True
                else:
                    lines.append(line)
    if not found:
        lines.append(f"{key}={value}\n")

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

update_env_value(env_path, "SECURITY_LEVEL", "private" if mode == "private" else "public")

print("\n🎉 Configuración finalizada con éxito.\n")



### NOTE IOS
# === . Modificar CFBundleDisplayName en Info.plist (iOS) === Su equivalente es AppName, nombre para mostrar en la lista de aplicaciones del telefono
try:
    with open(plist_path, 'r', encoding='utf-8') as f:
        plist = f.read()

    plist = re.sub(
        r'<key>CFBundleDisplayName</key>\s*<string>.*?</string>',
        f'<key>CFBundleDisplayName</key>\n\t<string>{app_name}</string>',
        plist
    )

    with open(plist_path, 'w', encoding='utf-8') as f:
        f.write(plist)

    print(f"✅ Nombre de la app (iOS) actualizado a: {app_name}")
except Exception as e:
    print(f"❌ Error actualizando Info.plist: {e}")

# === . Modificar PRODUCT_BUNDLE_IDENTIFIER en project.pbxproj === Su equivalente es PackageName, es decir, el identificador de la app 
pbxproj_path = os.path.join(base_dir, "ios/testDoc.xcodeproj/project.pbxproj") 

try:
    with open(pbxproj_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Reemplaza todas las ocurrencias (en este caso, debug y release)
    new_content = re.sub(
        r'PRODUCT_BUNDLE_IDENTIFIER = [^;]+;',
        f'PRODUCT_BUNDLE_IDENTIFIER = {new_package};',
        content
    )

    if content != new_content:
        with open(pbxproj_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"✅ PRODUCT_BUNDLE_IDENTIFIER actualizado en project.pbxproj → {new_package}")
    else:
        print("ℹ️ PRODUCT_BUNDLE_IDENTIFIER ya estaba actualizado")
except Exception as e:
    print(f"❌ Error actualizando project.pbxproj: {e}")


# === 5. Generar SplashScreen con react-native-bootsplash ===
if bootsplash_color:
    try:
        cmd = [
            npx_cmd, "--yes", "react-native", "generate-bootsplash",
            "assets/logo.png",
            "--platforms=android,ios",
            f"--background={bootsplash_color}",
            "--logo-width=250",
            "--assets-output=assets/bootsplash",
            "--flavor=main"
        ]
        print("\n⚡ Ejecutando:", " ".join(cmd))
        try:
            subprocess.run(cmd, check=True)
            print("✅ SplashScreen generada con éxito usando react-native-bootsplash")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error generando SplashScreen: {e}")
    except Exception as e:
        print(f"❌ Error generando SplashScreen: {e}")
else:
    print("⚠️ No se generó SplashScreen: bootsplash_background no definido en theme.json")

# === 6. Copiamos los mipmaps (android) del proyecto a android/ ===
def copy_mipmap_folders(provider):
    src_dir = os.path.join(base_dir, f"assets/deviceIcons/mipmaps/{provider}")
    dest_dir = os.path.join(base_dir, "android/app/src/main/res")

    if not os.path.exists(src_dir):
        print(f"❌ Carpeta de mipmaps del proveedor no existe: {src_dir}")
        return

    # Listar carpetas en src_dir
    for folder_name in os.listdir(src_dir):
        src_folder_path = os.path.join(src_dir, folder_name)
        dest_folder_path = os.path.join(dest_dir, folder_name)

        if os.path.isdir(src_folder_path):
            # Si la carpeta ya existe en res/, eliminarla
            if os.path.exists(dest_folder_path):
                try:
                    shutil.rmtree(dest_folder_path)
                    print(f"🗑️  Carpeta eliminada en res/: {dest_folder_path}")
                except Exception as e:
                    print(f"❌ Error eliminando {dest_folder_path}: {e}")

            # Copiar la carpeta nueva
            try:
                shutil.copytree(src_folder_path, dest_folder_path)
                print(f"✅ Carpeta copiada: {src_folder_path} → {dest_folder_path}")
            except Exception as e:
                print(f"❌ Error copiando {src_folder_path} a {dest_folder_path}: {e}")
copy_mipmap_folders(provider)

# === 7. Copiamos los AppIcon.appiconset (iOS) del proyecto a ios/ ===
def copy_ios_appicon(provider):
    src_dir = os.path.join(base_dir, f"assets/deviceIcons/AppIcon.appiconset/{provider}")
    dest_dir = os.path.join(base_dir, "ios/testDoc/Images.xcassets/AppIcon.appiconset")

    if not os.path.exists(src_dir):
        print(f"❌ Carpeta de AppIcon del proveedor no existe: {src_dir}")
        return

    # Eliminar todo el contenido viejo en la carpeta destino
    for item in os.listdir(dest_dir):
        item_path = os.path.join(dest_dir, item)
        try:
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)
            else:
                os.remove(item_path)
        except Exception as e:
            print(f"❌ Error eliminando {item_path}: {e}")

    # Copiar archivos y carpetas nuevos
    for item in os.listdir(src_dir):
        src_item_path = os.path.join(src_dir, item)
        dest_item_path = os.path.join(dest_dir, item)
        try:
            if os.path.isdir(src_item_path):
                shutil.copytree(src_item_path, dest_item_path)
            else:
                shutil.copy2(src_item_path, dest_item_path)
        except Exception as e:
            print(f"❌ Error copiando {src_item_path} → {dest_item_path}: {e}")

    print(f"✅ AppIcon actualizado para iOS desde {src_dir} → {dest_dir}")
copy_ios_appicon(provider)

# === Mapeo provider → sufix que aparece en globalVariables.ts ===
provider_sufix_map = {
    "vifinsa": "vif001",
    "chiapas": "CHP004",
    "edomex": "MEX010",
    "demo": "dem001",
    "plaresa": "pls001",
    "troqmex": "trm001",
    "safetyp": "sft001",
    "vfi": "vfi001"
}

current_sufix = provider_sufix_map.get(provider.lower())

# === Leer archivo ===
with open(global_vars_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# === Modificar líneas ===
new_lines = []
sufix_pattern = re.compile(r"^(//\s*)?export const sufix = '(.*?)';")

for line in lines:
    match = sufix_pattern.match(line)
    if match:
        sufix_value = match.group(2)
        if sufix_value == current_sufix:
            # Descomentar
            new_lines.append(f"export const sufix = '{sufix_value}';\n")
        else:
            # Comentar
            new_lines.append(f"// export const sufix = '{sufix_value}';\n")
    else:
        new_lines.append(line)

# === Guardar archivo ===
with open(global_vars_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"✅ globalVariables.ts actualizado para provider '{provider}' con sufix '{current_sufix}'")

# === 8. Modificar CameraScreen.tsx según provider ===
camera_screen_path = os.path.join(
    base_dir,
    "src/screens/CameraScreen.tsx"
)

def comment_line(line: str):
    if line.lstrip().startswith("//"):
        return line  # ya comentada
    return "// " + line

def uncomment_line(line: str):
    stripped = line.lstrip()
    if stripped.startswith("//"):
        # Remover SOLO el primer // que hace de comentario, no tocar otros //
        prefix_len = len(line) - len(line.lstrip())
        return line[:prefix_len] + stripped[2:].lstrip()
    return line  # ya descomentada

try:
    with open(camera_screen_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if len(lines) >= 121:
        if provider.lower() == "vfi":
            # === Si ES vfi ===
            lines[118] = comment_line(lines[118])       # Línea 119
            lines[120] = uncomment_line(lines[120])     # Línea 121
            print("✅ CameraScreen.tsx modificado para provider=vfi (119 comentada, 121 descomentada)")
        else:
            # === Si NO es vfi, revertir cambios ===
            lines[118] = uncomment_line(lines[118])     # Línea 119 vuelve a normal
            lines[120] = comment_line(lines[120])       # Línea 121 vuelve a estar comentada
            print("🔄 CameraScreen.tsx revertido (provider ≠ vfi)")
    else:
        print("⚠️ CameraScreen.tsx no tiene suficientes líneas (faltan 119 y 121)")

    with open(camera_screen_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

except Exception as e:
    print(f"❌ Error modificando CameraScreen.tsx: {e}")
