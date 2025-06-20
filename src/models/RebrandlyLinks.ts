export interface RebrandlyLinks {
  id: string;
  title: string;
  slashtag: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  clicks: string;
  sessions: string;
  lastClickDate: string;
  lastClickAt: string;
  isPublic: string;
  shortUrl: string;
  domainId: string;
  domainName: string;
  domain: Domain;
  https: string;
  favourite: string;
  creator: Creator;
  integrated: string;
}
interface Domain {
  id: string;
  ref: string;
  fullName: string;
  active: string;
}
interface Creator {
  id: string;
  fullName: string;
  avatarUrl: string;
}
