import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';

describe('D&D Combat API - E2E', () => {
  const baseUrl = 'https://dnd-combat-api-7f3660dcecb1.herokuapp.com/api';

  const validCharacter = {
    name: "Kaya",
    strength: 10,
    dexterity: 7,
    hitPoints: 11,
    armorClass: 12
  };

  const invalidCharacter = {
    name: "Invalid"
  };

  beforeAll(() => {
    pactum.request.setDefaultTimeout(10000);
  });

  describe('MONSTERS', () => {

    it('GET monsters names - positive', async () => {
  await pactum
    .spec()
    .get(`${baseUrl}/monsters/names/1`)
    .expectStatus(StatusCodes.OK)
    .expectJsonLike([/\w+/]);
    });

    it('GET monsters names - negative (invalid page)', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/monsters/names/999`)
        .expectStatus(500); // API bug → retorna 500
    });

    it('GET monster by name - positive', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/monsters/goblin`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: 'Goblin'
        });
    });

    it('GET monster by name - negative (not found)', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/monsters/unknown-monster`)
        .expectStatus(500); // API bug
    });

  });

  describe('CHARACTERS', () => {

    it('POST character check - positive', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/characters/check`)
        .withJson(validCharacter)
        .expectStatus(StatusCodes.OK);
    });

    it('POST character check - negative', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/characters/check`)
        .withJson(invalidCharacter)
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

  });

  describe('BATTLE', () => {

    it('POST battle - positive', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/battle/goblin`)
        .withJson(validCharacter)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          winner: /\w+/,
          rounds: /\d+/,
          finalMessage: /\w+/,
          battleLog: []
        });
    });

    it('POST battle - negative (invalid character)', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/battle/goblin`)
        .withJson(invalidCharacter)
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('POST battle - negative (monster not found)', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/battle/unknown`)
        .withJson(validCharacter)
        .expectStatus(500); // API bug
    });

  });

});