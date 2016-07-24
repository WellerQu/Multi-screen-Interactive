/**
 * [工具]节流函数
 */

export function throttle(fn, delay, atLeast) {
    let timer = null;
    let previous = null;

    return function() {
        let now = +new Date;
        if (!previous) previous = now;
        if (now - previous > atLeast) {
            fn();
            // reset last end time
            previous = now;
        } else {
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn();
            }, delay);
        }
    };
};
