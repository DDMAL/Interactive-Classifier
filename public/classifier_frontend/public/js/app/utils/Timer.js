export default class Timer {
    constructor(name)
    {
        this.name = String(name);
        this.start = new Date().getTime();
        this.iterator = 0;
    }

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