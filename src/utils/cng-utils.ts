//Timer for Schedule run function
export class TimerSchedule {
    //Doi tuong thoi gian
    public interval: number = 1000;
    public fRun: any;
    private runSchedule: any;
    
    public startTimer() {
        this.runSchedule = setInterval(() => {
            if (this.fRun) {
                this.fRun();
            }        
        }, this.interval)
    }

    public stopTimer() {
        clearInterval(this.runSchedule);
    }
}