import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { PersonProfile, PersonCreateRequest, PersonUpdateRequest } from '../types/person';

/**
 * Person Repository - Handles Person data storage
 * Uses JSON file storage for simplicity
 */
export class PersonRepository {
    private dataDir: string;
    private personsFile: string;

    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.personsFile = path.join(this.dataDir, 'persons.json');
    }

    /**
     * Initialize repository (create data directory and file if not exists)
     */
    async initialize(): Promise<void> {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            
            try {
                await fs.access(this.personsFile);
            } catch {
                // File doesn't exist, create it
                await fs.writeFile(this.personsFile, JSON.stringify([], null, 2));
            }
        } catch (error) {
            console.error('Error initializing PersonRepository:', error);
            throw error;
        }
    }

    /**
     * Get all persons
     */
    private async getAllPersons(): Promise<PersonProfile[]> {
        try {
            const data = await fs.readFile(this.personsFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading persons file:', error);
            return [];
        }
    }

    /**
     * Save all persons
     */
    private async saveAllPersons(persons: PersonProfile[]): Promise<void> {
        await fs.writeFile(this.personsFile, JSON.stringify(persons, null, 2));
    }

    /**
     * Generate unique person ID
     */
    private generatePersonId(ownerId: string, name: string, birthYear: string): string {
        const sanitizedName = name.replace(/\s+/g, '').toLowerCase();
        const baseId = `${ownerId}_${sanitizedName}_${birthYear}`;
        const hash = crypto.createHash('md5').update(baseId).digest('hex').substring(0, 8);
        return `${sanitizedName}_${birthYear}_${hash}`;
    }

    /**
     * Add new person
     */
    async addPerson(request: PersonCreateRequest): Promise<PersonProfile> {
        await this.initialize();
        
        const persons = await this.getAllPersons();
        
        // Generate unique ID
        const id = this.generatePersonId(
            request.ownerId,
            request.name,
            request.birthTime.year.toString()
        );

        // Check for duplicates
        const exists = persons.find(p => p.id === id);
        if (exists) {
            throw new Error(`Person with ID ${id} already exists`);
        }

        const newPerson: PersonProfile = {
            id,
            ownerId: request.ownerId,
            name: request.name,
            birthTime: request.birthTime,
            gender: request.gender,
            notes: request.notes || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        persons.push(newPerson);
        await this.saveAllPersons(persons);

        return newPerson;
    }

    /**
     * Update existing person
     */
    async updatePerson(request: PersonUpdateRequest): Promise<PersonProfile> {
        await this.initialize();
        
        const persons = await this.getAllPersons();
        const index = persons.findIndex(p => p.id === request.id && p.ownerId === request.ownerId);

        if (index === -1) {
            throw new Error(`Person with ID ${request.id} not found`);
        }

        const updatedPerson: PersonProfile = {
            ...persons[index],
            name: request.name,
            birthTime: request.birthTime,
            gender: request.gender,
            notes: request.notes || '',
            updatedAt: new Date()
        };

        persons[index] = updatedPerson;
        await this.saveAllPersons(persons);

        return updatedPerson;
    }

    /**
     * Delete person
     */
    async deletePerson(ownerId: string, personId: string): Promise<boolean> {
        await this.initialize();
        
        const persons = await this.getAllPersons();
        const index = persons.findIndex(p => p.id === personId && p.ownerId === ownerId);

        if (index === -1) {
            throw new Error(`Person with ID ${personId} not found`);
        }

        persons.splice(index, 1);
        await this.saveAllPersons(persons);

        return true;
    }

    /**
     * Get person by ID
     */
    async getPersonById(ownerId: string, personId: string): Promise<PersonProfile | null> {
        await this.initialize();
        
        const persons = await this.getAllPersons();
        return persons.find(p => p.id === personId && p.ownerId === ownerId) || null;
    }

    /**
     * Get all persons for owner
     */
    async getPersonsByOwner(ownerId: string): Promise<PersonProfile[]> {
        await this.initialize();
        
        const persons = await this.getAllPersons();
        return persons.filter(p => p.ownerId === ownerId);
    }

    /**
     * Get hash of person list for caching
     */
    async getPersonListHash(ownerId: string): Promise<string> {
        const persons = await this.getPersonsByOwner(ownerId);
        
        // Create concatenated string of all person data
        const dataString = persons
            .map(p => `${p.id}${p.name}${JSON.stringify(p.birthTime)}${p.notes}`)
            .join('');

        // Generate SHA256 hash
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }
}
