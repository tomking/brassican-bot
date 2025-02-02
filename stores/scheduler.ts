import { IScheduler, Scheduler } from '.';

export interface Repository<T> {
    selectAll(): Promise<T[]>;
}

export class SchedulerRepository implements Repository<IScheduler> {
    public async selectAll(): Promise<IScheduler[]> {
        return Scheduler.find().exec();
    }

    public async insert(scheduler: IScheduler): Promise<IScheduler> {
        return Scheduler.create(scheduler);
    }
}
