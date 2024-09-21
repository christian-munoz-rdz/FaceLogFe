export interface AreaModel {
  id: number | null;
  name: string;
  description: string;
  module: string
  classroom: string;
  campus: string;
  department: string;
  division: string;
  image: Array<Array<number>> | null;
}
