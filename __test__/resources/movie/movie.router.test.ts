import supertest from 'supertest';
import { writeJsonSync } from 'fs-extra';
import app from '../../../src/app';
import IDbSchema from '../../../src/database/IDbSchema';
import { IGetMoviesDto } from '../../../src/resources/movie/dtos/getMovies.dto';
import { DB_FILE } from '../../config.test';
import { genres, movies } from '../../data';

const request = supertest(app);

const seedDbFile = (data: IDbSchema) => {
    writeJsonSync(DB_FILE, data, { spaces: 2 });
};

describe('Tests for the GET /api/movie endpoints', () => {
    describe('GET / endpoint.', () => {
        describe('Correct results/no errors expected.', () => {
            beforeAll(() => seedDbFile({ genres, movies }));

            test(`Should return one movie.`, async () => {
                const res = await request.get('/api/movie/');
                const moviesDto: IGetMoviesDto = res.body;
                const randomMovie = moviesDto.movies[0];

                const isContainedInDataFromDBFile = movies.some(
                    (m) => m.id === randomMovie.id
                );

                expect(res.status).toBe(200);
                expect(moviesDto.movies).toHaveLength(1);
                expect(isContainedInDataFromDBFile).toBe(true);
            });
        });

        describe(`Errors expected`, () => {
            test(`There are no movies in the db. Should return a json error with proper message.`, async () => {
                seedDbFile({ genres: [], movies: [] });
                const res = await request.get('/api/movie/');
                const errorObj = {
                    error: 'There are no movies in the database',
                };

                expect(res.status).toBe(500);
                expect(res.body).toEqual(errorObj);
            });
        });
    });

    describe(`GET /:durationFrom/:durationTo endpoint.`, () => {
        describe('Correct results/no errors expected.', () => {
            beforeAll(() => seedDbFile({ genres, movies }));

            test('Duration from and to are valid, positive numbers. From is smaller than To. Should return movies with runtime between.', async () => {
                const durationFrom = 100;
                const durationTo = 120;
                const idsOfMovies0WithDurationBetween = [2, 4, 5];

                const res = await request.get(
                    `/api/movie/${durationFrom}/${durationTo}`
                );
                const movies = res.body.movies;

                expect(res.status).toBe(200);
                expect(movies).toHaveLength(3);
                movies.forEach((m) => {
                    const isInCorrectIds = idsOfMovies0WithDurationBetween.includes(
                        m.id
                    );
                    expect(isInCorrectIds).toBe(true);
                });
            });
        });

        describe(`Errors expected`, () => {
            test(`Duration from is bigger than to. Should return a json error with a proper message.`, async () => {
                const durationFrom = 10;
                const durationTo = 5;
                const errorObj = {
                    error: 'Duration FROM number can not be greater than duration TO number',
                };

                const res = await request.get(
                    `/api/movie/${durationFrom}/${durationTo}`
                );

                expect(res.status).toBe(400);
                expect(res.body).toEqual(errorObj);
            });

            test(`Duration from and/or duration to are not a number. Should return a json error with a proper message`, async () => {
                const durationInvalid = 'sds';
                const durationValid = 19;
                const errorObj = {
                    error: 'Duration must be an integer number',
                };

                const resFromInvalid = await request.get(
                    `/api/movie/${durationInvalid}/${durationValid}`
                );
                const resToInvalid = await request.get(
                    `/api/movie/${durationValid}/${durationInvalid}`
                );

                const results = [resFromInvalid, resToInvalid];
                results.forEach((res) => {
                    expect(res.status).toBe(400);
                    expect(res.body).toEqual(errorObj);
                });
            });

            test(`Duration from and duration to are negative values. Should send back a json object with a proper error message.`, async () => {
                const durationNegative = -10;
                const durationPositive = 5;
                const errorObj = {
                    error: 'Duration must be a positive number',
                };

                const resFromNegative = await request.get(
                    `/api/movie/${durationNegative}/${durationPositive}`
                );
                const resToNegative = await request.get(
                    `/api/movie/${durationPositive}/${durationNegative}`
                );

                const results = [resFromNegative, resToNegative];
                results.forEach((res) => {
                    expect(res.status).toBe(400);
                    expect(res.body).toEqual(errorObj);
                });
            });

            test(`Duration values are bigger than max value. Should send back a json object with a proper error message.`, async () => {
                const durationBiggerThanMax = 6000;
                const errorObjMax = {
                    error: `Duration must be smaller than 1000`,
                };

                const resTooBig = await request.get(
                    `/api/movie/${durationBiggerThanMax}/${durationBiggerThanMax}`
                );

                expect(resTooBig.status).toBe(400);
                expect(resTooBig.body).toEqual(errorObjMax);
            });

            test(`There are no movies in the db. Should return a json error with proper message.`, async () => {
                const durationFrom = 100;
                const durationTo = 120;
                const errorObj = {
                    error: 'There are no movies in the database',
                };

                seedDbFile({ genres: [], movies: [] });
                const res = await request.get(
                    `/api/movie/${durationFrom}/${durationTo}`
                );

                expect(res.status).toBe(500);
                expect(res.body).toEqual(errorObj);
            });
        });
    });
});

describe('Correct results/no errors expected.', () => {});

describe(`Errors expected`, () => {});
