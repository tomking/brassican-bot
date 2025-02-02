import { SchedulerRepository } from '../../stores/scheduler';

export const getAllActiveScheduledActions = async () => {
    const schedulerRepository = new SchedulerRepository();
    return schedulerRepository.selectAll();
};
