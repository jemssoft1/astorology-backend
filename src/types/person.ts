import { Time } from './interfaces';

/**
 * Person Gender
 */
export enum Gender {
    Male = 'Male',
    Female = 'Female'
}

/**
 * Person Profile
 */
export interface PersonProfile {
    id: string;
    ownerId: string;
    name: string;
    birthTime: Time;
    gender: Gender;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Person Create Request
 */
export interface PersonCreateRequest {
    ownerId: string;
    name: string;
    birthTime: Time;
    gender: Gender;
    notes?: string;
}

/**
 * Person Update Request
 */
export interface PersonUpdateRequest {
    id: string;
    ownerId: string;
    name: string;
    birthTime: Time;
    gender: Gender;
    notes?: string;
}

/**
 * Person List Response
 */
export interface PersonListResponse {
    persons: PersonProfile[];
    hash: string;
}
