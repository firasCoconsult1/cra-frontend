import { DayEntry } from "./DayEntry";

  export interface Calendre {
    idCalendre: number | null;
    client: string;
    mission: string;
    days: DayEntry[];
  }
  
  