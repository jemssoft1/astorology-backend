import { Time } from './interfaces';

/**
 * Life Path Event - represents a single astrological event/prediction
 */
export interface LifeEvent {
    Name: string;
    Description: string;
    NatureScore: number;
    DurationHour: number;
    DurationMin: number;
    Age: number;
    MinNatureScore: number;
    MaxNatureScore: number;
}

/**
 * Time Slice - represents a specific time period with associated events
 */
export interface TimeSlice {
    Index: number;
    StdTime: string;
    Year: number;
    Month: number;
    Date: number;
    Hour: number;
    Events: LifeEvent[];
}

/**
 * Life Path Configuration
 */
export interface LifePathConfiguration {
    SvgWidth: number;
    DaysPerPixel: number;
    WidthPerSlice: number;
    SingleRowHeight: number;
    SummaryRowHeight: number;
    DescriptionBackgroundWidth: number;
    EventsPrecisionHours: number;
    RemovedShortEventsCount: number;
    TotalEventsCount: number;
}

/**
 * Person Info for Life Path
 */
export interface LifePathPerson {
    BirthTime: string;
    BirthLocation: string;
}

/**
 * Complete Life Path Prediction
 */
export interface LifePathPrediction {
    ChartId: string;
    Person: LifePathPerson;
    Configuration: LifePathConfiguration;
    TimeSlices: TimeSlice[];
}

/**
 * Life Path Request Parameters
 */
export interface LifePathRequest {
    birthTime: Time;
    startDate?: Date;
    endDate?: Date;
    daysPerPixel?: number;
    precisionHours?: number;
}
