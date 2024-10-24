import { Store } from 'pullstate'

export const StepStore = new Store({
    current_step: 1,
    step1_validate: false,
    step1_complete: false,
    step2_validate: false,
    step2_complete: false,
    step3_validate: false,
    step3_complete: false
})