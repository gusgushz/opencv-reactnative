export interface Service {
  id: number;
  service_db_id: number;
  name: string;
  state_id: number;
  parent_service_id: number;
  created_at: string;
  has_frontal: number;
  has_engomado: number;
  has_rear: number;
  parent_service_name: string;
}
