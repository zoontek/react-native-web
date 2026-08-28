/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Mock } from 'vitest';

import type TaskQueueType from '../TaskQueue';

function expectToBeCalledOnce(fn: Mock) {
  expect(fn.mock.calls.length).toBe(1);
}

function clearTaskQueue(taskQueue: TaskQueueType) {
  do {
    vi.runAllTimers();
    taskQueue.processNext();
    vi.runAllTimers();
  } while (taskQueue.hasTasksToProcess());
}

describe('TaskQueue', () => {
  let taskQueue: TaskQueueType;
  let onMoreTasks: Mock;
  let sequenceId: number;

  function createSequenceTask(expectedSequenceId: number) {
    return vi.fn(() => {
      expect(++sequenceId).toBe(expectedSequenceId);
    });
  }

  beforeEach(async () => {
    vi.resetModules();
    onMoreTasks = vi.fn();
    const TaskQueue = (await import('../TaskQueue')).default;
    taskQueue = new TaskQueue({ onMoreTasks });
    sequenceId = 0;
  });

  it('should run a basic task', () => {
    const task1 = createSequenceTask(1);
    taskQueue.enqueue({ run: task1, name: 'run1' });
    expect(taskQueue.hasTasksToProcess()).toBe(true);
    taskQueue.processNext();
    expectToBeCalledOnce(task1);
  });

  it('should handle blocking promise task', () => {
    onMoreTasks.mockImplementation(() => {
      taskQueue.processNext();
      vi.runAllTimers();
    });

    const task1 = vi.fn(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(++sequenceId).toBe(1);
          resolve();
        }, 1);
      });
    });
    const task2 = createSequenceTask(2);
    taskQueue.enqueue({ gen: task1, name: 'gen1' });
    taskQueue.enqueue({ run: task2, name: 'run2' });

    taskQueue.processNext();

    expectToBeCalledOnce(task1);
    expect(task2).not.toHaveBeenCalled();
    expect(onMoreTasks).not.toHaveBeenCalled();
    expect(taskQueue.hasTasksToProcess()).toBe(false);

    clearTaskQueue(taskQueue);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      });
    }).then(() => {
      expectToBeCalledOnce(onMoreTasks);
      expectToBeCalledOnce(task2);
    });
  });

  it('should handle nested simple tasks', () => {
    const task1 = vi.fn(() => {
      expect(++sequenceId).toBe(1);
      taskQueue.enqueue({ run: task3, name: 'run3' });
    });
    const task2 = createSequenceTask(2);
    const task3 = createSequenceTask(3);
    taskQueue.enqueue({ run: task1, name: 'run1' });
    taskQueue.enqueue({ run: task2, name: 'run2' }); // not blocked by task 1

    clearTaskQueue(taskQueue);

    expectToBeCalledOnce(task1);
    expectToBeCalledOnce(task2);
    expectToBeCalledOnce(task3);
  });

  it('should handle nested promises', () => {
    onMoreTasks.mockImplementation(() => {
      taskQueue.processNext();
      vi.runAllTimers();
    });

    const task1 = vi.fn(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(++sequenceId).toBe(1);
          taskQueue.enqueue({ gen: task2, name: 'gen2' });
          taskQueue.enqueue({ run: resolve, name: 'resolve1' });
        }, 1);
      });
    });
    const task2 = vi.fn(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(++sequenceId).toBe(2);
          taskQueue.enqueue({ run: task3, name: 'run3' });
          taskQueue.enqueue({ run: resolve, name: 'resolve2' });
        }, 1);
      });
    });
    const task3 = createSequenceTask(3);
    const task4 = createSequenceTask(4);
    taskQueue.enqueue({ gen: task1, name: 'gen1' });
    taskQueue.enqueue({ run: task4, name: 'run4' }); // blocked by task 1 promise

    clearTaskQueue(taskQueue);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      });
    }).then(() => {
      expectToBeCalledOnce(task1);
      expectToBeCalledOnce(task2);
      expectToBeCalledOnce(task3);
      expectToBeCalledOnce(task4);
    });
  });

  it('should be able to cancel tasks', () => {
    const task1 = vi.fn();
    const task2 = createSequenceTask(1);
    const task3 = vi.fn();
    const task4 = createSequenceTask(2);
    taskQueue.enqueue(task1);
    taskQueue.enqueue(task2);
    taskQueue.enqueue(task3);
    taskQueue.enqueue(task4);
    taskQueue.cancelTasks([task1, task3]);
    clearTaskQueue(taskQueue);
    expect(task1).not.toHaveBeenCalled();
    expect(task3).not.toHaveBeenCalled();
    expectToBeCalledOnce(task2);
    expectToBeCalledOnce(task4);
    expect(taskQueue.hasTasksToProcess()).toBe(false);
  });

  it('should not crash when last task is cancelled', () => {
    const task1 = vi.fn();
    taskQueue.enqueue(task1);
    taskQueue.cancelTasks([task1]);
    clearTaskQueue(taskQueue);
    expect(task1).not.toHaveBeenCalled();
    expect(taskQueue.hasTasksToProcess()).toBe(false);
  });

  it('should not crash when task is cancelled between being started and resolved', () => {
    const task1 = vi.fn(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1);
      });
    });

    taskQueue.enqueue({ gen: task1, name: 'gen1' });
    taskQueue.processNext();
    taskQueue.cancelTasks([task1]);
    vi.runAllTimers();
  });
});
