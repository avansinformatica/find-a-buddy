import { Observable } from 'rxjs';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
  let interceptor, next;

  beforeEach(() => {
    interceptor = new ApiResponseInterceptor();
    next = {
      handle: jest.fn()
    };
  });

  it('handles a single object', () => {
    const object = {object: 'object'};

    next.handle.mockReturnValue(new Observable(sub => sub.next(object)));

    const obs = interceptor.intercept({}, next);
    
    obs.subscribe(response => {
      expect(response).toHaveProperty('results', object);
      expect(response).toHaveProperty('info', {version: '1.0', type: 'object', count: 1});
    });
  });

  it('handles an array of objects', () => {
    const array = [1,2,3,4];

    next.handle.mockReturnValue(new Observable(sub => sub.next(array)));

    const obs = interceptor.intercept({}, next);
    
    obs.subscribe(response => {
      expect(response).toHaveProperty('results', array);
      expect(response).toHaveProperty('info', {version: '1.0', type: 'list', count: 4});
    });
  });

  it('handles undefined', (jestNext) => {
    next.handle.mockReturnValue(new Observable(sub => sub.next(undefined)));

    const obs = interceptor.intercept({}, next);
    
    obs.subscribe(response => {
      expect(response).toHaveProperty('info', {version: '1.0', type: 'none', count: 0});
      jestNext();
    });
  });
});
