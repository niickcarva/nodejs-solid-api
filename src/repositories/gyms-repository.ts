import { Gym, Prisma } from "@prisma/client";

export interface GymsRepository {
  findById(id: string): Promise<Gym | null>;
  searchMany(query: string, page: number, size: number): Promise<Gym[]>;
  create(data: Prisma.GymUncheckedCreateInput): Promise<Gym>;
}
