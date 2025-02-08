import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";

import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { CheckInUseCase } from "./check-in";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";
import { MaxDistanceError } from "./errors/max-distance-error";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check-in Use Case", () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    await gymsRepository.create({
      id: "gym-01",
      title: "JavaScript Gym",
      description: "",
      phone: "",
      latitude: -1.6223457,
      longitude: -53.473805,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check in", async () => {
    const { checkIn } = await sut.execute({
      userId: "user-01",
      gymId: "gym-01",
      userLatitude: -1.6223457,
      userLongitude: -53.473805,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      userId: "user-01",
      gymId: "gym-01",
      userLatitude: -1.6223457,
      userLongitude: -53.473805,
    });

    await expect(() =>
      sut.execute({
        userId: "user-01",
        gymId: "gym-01",
        userLatitude: -1.6223457,
        userLongitude: -53.473805,
      })
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });

  it("should be able to check in twice but in different days", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      userId: "user-01",
      gymId: "gym-01",
      userLatitude: -1.6223457,
      userLongitude: -53.473805,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn: checkIn2 } = await sut.execute({
      userId: "user-01",
      gymId: "gym-01",
      userLatitude: -1.6223457,
      userLongitude: -53.473805,
    });

    expect(checkIn2.id).toEqual(expect.any(String));
  });

  it("should not be able to check in on distant gym", async () => {
    await gymsRepository.create({
      id: "gym-02",
      title: "JavaScript Gym 2",
      description: "",
      phone: "",
      // Latitude and Longitude of Neo Quimica Arena
      latitude: -23.5453085,
      longitude: -46.4768041,
    });

    await expect(() =>
      sut.execute({
        userId: "user-01",
        gymId: "gym-02",
        userLatitude: -23.5410242,
        userLongitude: -46.4713436,
      })
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });
});
