export interface ClientConfig {
  AppName: string;
  PackageName: string;
  Client: Client;
  Regions: Regions[];
  Provider: Provider;
  PermissionLevels: PermissionLevels;
}

export interface Client {
  Id: string;
}

export interface PermissionLevels {
  public: Permission[];
  private: Permission[];
}

export interface Permission {
  Level: string;
  ReadOrderEnabled: boolean;
  DocumentsToRead: DocumentsToRead[];
  FieldsToShow: string[];
}

export interface DocumentsToRead {
  Name: string;
  Enabled: boolean;
  Priority: number;
}

export interface Regions {
  Id: string;
  Name: string;
}
export interface Provider {
  Id: string;
  Name: string;
}
