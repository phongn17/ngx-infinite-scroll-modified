import { Injectable, NgZone } from "@angular/core";
import { Observable, PartialObserver } from "rxjs";

@Injectable()
export class SafeNgZone<T>{

  constructor(private ngZone: NgZone) {
  }

  safeSubscribe(observable: Observable<T>, observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void) {
    return this.ngZone.runOutsideAngular(() => {
        return observable.subscribe(null, error, complete);
      }
    );
  }

  private callbackSubscriber (obs: PartialObserver<T> | ((value: T) => void)) {
    if (typeof obs === "object") {
      let observer: PartialObserver<T> = {
          next: (value: T) => {
            obs['next'] && this.ngZone.run(() => obs['next'](value));
          },
          error: (err: any) => {
            obs['error'] && this.ngZone.run(() => obs['error'](err));
          },
          complete: () => {
            obs['complete'] && this.ngZone.run(() => obs['complete']());
          }
      };
      return observer;
    } else if (typeof obs === "function") {
      return (value: T) => {
        this.ngZone.run(() => obs(value));
      };
    }
  }
}