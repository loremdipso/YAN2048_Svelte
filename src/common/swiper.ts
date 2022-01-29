
interface ISwiperConfig {
	threshold: number
}

interface ISwiperCallback {
	(direction: 'up' | 'down' | 'left' | 'right'): any
}

const MIN_THRESHOLD = 1;

// modified from https://stackoverflow.com/a/56663695
export class Swiper {
	private config: ISwiperConfig = {
		threshold: MIN_THRESHOLD
	};
	private listeners: any = {};

	private touchStartX = 0;
	private touchEndX = 0;

	private touchStartY = 0;
	private touchEndY = 0;

	constructor(private element: Element, private callback: ISwiperCallback, config?: ISwiperConfig) {
		if (config) {
			this.config = { ...config };
		}
		this.config.threshold = Math.max(this.config.threshold, MIN_THRESHOLD);
		this.start();
	}

	public stop() {
		// TODO: test if it's still in the DOM?
		if (this.element) {
			this.removeEventListeners();
		}
	}

	// TODO: figure out the right typings here
	private addEventListener<K extends keyof ElementEventMap>(key: any, cb: any) {
		this.element.addEventListener(key, cb);
		if (!this.listeners[key]) {
			this.listeners[key] = [cb];
		} else {
			this.listeners[key].push(cb);
		}
	}

	private removeEventListeners() {
		// TODO: is this right?
		for (const key in this.listeners) {
			if (this.listeners.hasOwnProperty(key)) {
				const arr = this.listeners[key];
				for (const cb of arr) {
					this.element.removeEventListener(key, cb);
				}
			}
		}
	}

	private start() {
		this.addEventListener('touchstart', e => {
			this.touchStartX = e.changedTouches[0].screenX;
			this.touchStartY = e.changedTouches[0].screenY;
			e.preventDefault();
		});

		this.addEventListener('touchend', e => {
			this.touchEndX = e.changedTouches[0].screenX;
			this.touchEndY = e.changedTouches[0].screenY;
			this.handleGesture();
			e.preventDefault();
		});
	}

	private handleGesture() {
		let xDelta = this.touchEndX - this.touchStartX;
		let yDelta = this.touchEndY - this.touchStartY;
		let xDeltaAbs = Math.abs(xDelta);
		let yDeltaAbs = Math.abs(yDelta);

		if (xDeltaAbs > this.config.threshold || yDeltaAbs > this.config.threshold) {
			if (xDeltaAbs > yDeltaAbs) {
				if (xDelta > 0) {
					this.callback("right");
				} else {
					this.callback("left");
				}
			} else {
				if (yDelta > 0) {
					this.callback("down");
				} else {
					this.callback("up");
				}
			}
		}
	}
}