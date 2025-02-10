import { expect, describe, it, beforeEach } from "vitest";

import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { FetchNearbyGymsUseCase } from "./fetch-nearby-gyms";

let gymsRepository: InMemoryGymsRepository;
let sut: FetchNearbyGymsUseCase;

describe("Fetch Nearby Gyms Use Case", () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new FetchNearbyGymsUseCase(gymsRepository);
  });

  it("should be able to fetch nearby gyms", async () => {
    await gymsRepository.create({
      title: "Nearby Gym",
      description: null,
      phone: null,
      // Latitude and Longitude of Neo Quimica Arena
      latitude: -23.5453085,
      longitude: -46.4768041,
    });
    await gymsRepository.create({
      title: "Far Gym",
      description: null,
      phone: null,
      // Latitude and Longitude of Allianz Parque
      latitude: -23.5276158,
      longitude: -46.6810411,
    });

    const { gyms } = await sut.execute({
      userLatitude: -23.544915,
      userLongitude: -46.4744545,
    });

    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([expect.objectContaining({ title: "Nearby Gym" })]);
  });
});
