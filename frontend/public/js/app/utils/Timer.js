/**
 * A Timer class for use in application performance profiling.
 */
export default class Timer {

    /**
     * Construct the Timer and set the initial time.  All future ticks will measure time elapsed since this function
     * was called.
     *
     * @param name
     */
    constructor(name)
    {
        this.name = String(name);
        this.start = new Date().getTime();
        this.iterator = 0;
    }

    /**
     * Print the miliseconds elapsed since Timer was initialized.
     *
     * @param name Optional name to attach to the tick log.
     */
    tick(name)
    {
        var duration = new Date().getTime() - this.start;
        this.iterator++;
        if (name)
        {
            console.log(this.name + " Timer Tick " + name + ": " + duration);
        }
        else
        {
            console.log(this.name + " Timer Tick " + this.iterator + ": " + duration);
        }
    }
}