/*
Modified code from https://sebhastian.com/doubly-linked-list-javascript/
*/

import { VectorObjectClass } from "./shapes/vectorObject";

function createNode(value: VectorObjectClass) {
    return {
        value: value,
        next: null,
        previous: null,
    };
}

export class DoublyLinkedList {
    public head: any;
    public tail: any;
    public length: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    public insert(value: VectorObjectClass) {
        this.length++;
        let newNode = createNode(value);
      
        if (this.tail) {
            // list is not empty
            this.tail.next = newNode;
            newNode.previous = this.tail;
            this.tail = newNode;
            return newNode;
        }
      
        this.head = this.tail = newNode;
        return newNode;
    }

    public print() {
        let current = this.head;
        while (current) {
            console.log(
            `previous: [ ${current.previous?.value.getId()} : ${current.previous?.value.getZ()}], current [${current.value.getId()} : ${current.value.getZ()} ], next: [ ${current.next?.value.getId()} : ${current.next?.value.getZ()}]`
            );
            current = current.next;
        }
    }

    public remove() {
        if (this.tail) {
            this.length--;
      
            const removedTail = this.tail;
      
            this.tail = this.tail.previous;
            if (this.tail) {
                this.tail.next = null;
            } else {
                this.head = null;
            }
      
            return removedTail;
        }
        return undefined;
    }

    public insertHead(value: VectorObjectClass) {
        this.length++;
        let newNode = createNode(value);
      
        if (this.head) {
            this.head.previous = newNode;
            newNode.next = this.head;
            this.head = newNode;
            return newNode;
        }
      
        this.head = this.tail = newNode;
        return newNode;
    }

    public removeHead() {
        if (this.head) {
            this.length--;
            const removedHead = this.head;
            this.head = this.head.next;
      
            if(this.head){
                this.head.previous = null;
            } else {
                this.tail = null;
            }
      
            return removedHead;
        }
        return undefined;
    }

    public insertIndex(value: VectorObjectClass, index: number) {
        if (index >= this.length) {
            throw new Error("Insert index out of bounds");
        }
      
        if (index === 0) {
            return this.insertHead(value);
        }
      
        this.length++;
        let currentNode = this.head;
        for (let i = 0; i < index; i++) {
            currentNode = currentNode.next;
        }
        const previousNode = currentNode.previous;
        const newNode = createNode(value);
        if (newNode) {
            newNode.next = currentNode;
            newNode.previous = previousNode;
        }
        if (previousNode) {
            previousNode.next = newNode;
        }
        currentNode.previous = newNode;
        return newNode;
    }
      
    public removeIndex(index: number) {
        if (index >= this.length) {
            throw new Error("Remove index out of bounds");
        }
      
        if (index === 0) {
            return this.removeHead();
        }
      
        this.length--;
        let currentNode = this.head;
        for (let i = 0; i < index; i++) {
            currentNode = currentNode.next;
        }
        const previousNode = currentNode.previous;
        const nextNode = currentNode.next;
        if (previousNode) {
            previousNode.next = nextNode;
        }
        if (nextNode) {
            nextNode.previous = previousNode;
        }

        if (currentNode == this.tail) {
            this.tail = currentNode.previous;
        }

        return currentNode;
    }

    public getIndex(value: VectorObjectClass) {
        let index: number = 0;
        let currentNode = this.head;
        if (currentNode && currentNode.value == value) {
            return index;
        }
        for (let i = 1; i < this.length; i++) {
            currentNode = currentNode.next;
            index += 1;
            if (currentNode && currentNode.value == value) {
                return index;
            }
        }

        return -1;
    }

    public getNode(index: number) {
        if (index >= this.length) {
            throw new Error("Index out of bounds");
        }
      
        if (index === 0) {
            return this.head;
        }

        let currentNode = this.head;

        for (let i = 1; i <= index; i++) {
            currentNode = currentNode.next;
        }

        return currentNode;
    }

    public bumpUp(index: number) {
        if (index >= this.length) {
            throw new Error("Index out of bounds");
        }
      
        if (index === (this.length - 1)) {
            return null;
        }

        let value: VectorObjectClass = this.getNode(index).value;
        let value2: VectorObjectClass = this.getNode(index + 1).value;

        this.removeIndex(index);

        if (this.getNode(index) == this.tail) {
            this.insert(value);
        } else {
            this.insertIndex(value, (index + 1));
        }

        let previousZ = value.getZ();
        let newZ = value2.getZ();

        value.setZ(newZ);
        value2.setZ(previousZ);

        return [{
            id: value.getId(),
            z: value.getZ()
        }, {
            id: value2.getId(),
            z: value2.getZ()
        }];
    }

    public bumpDown(index: number) {
        if (index >= this.length) {
            throw new Error("Index out of bounds");
        }
      
        if (index === 0) {
            return null;
        }

        let value: VectorObjectClass = this.getNode(index).value;
        let value2: VectorObjectClass = this.getNode(index - 1).value;

        this.removeIndex(index);

        if (this.getNode(index - 1) == this.head) {
            this.insertHead(value);
        } else {
            this.insertIndex(value, (index - 1));
        }

        let previousZ = value.getZ();
        let newZ = value2.getZ();

        value.setZ(newZ);
        value2.setZ(previousZ);

        return [{
            id: value.getId(),
            z: value.getZ()
        }, {
            id: value2.getId(),
            z: value2.getZ()
        }];
    }

    public sendToBack(index: number) {
        if (index >= this.length) {
            throw new Error("Index out of bounds");
        }

        if (index === 0) {
            return null;
        }

        let value: VectorObjectClass = this.getNode(index).value;
        this.removeIndex(index);

        let value2: VectorObjectClass = this.head.value;

        let newZ = value2.getZ() - 1;
        value.setZ(newZ);

        this.insertHead(value);

        return [{
            id: value.getId(),
            z: value.getZ()
        }]
    }

    public bringToFront(index: number) {
        if (index >= this.length) {
            throw new Error("Index out of bounds");
        }

        if (index === (this.length - 1)) {
            return null;
        }

        let value: VectorObjectClass = this.getNode(index).value;
        this.removeIndex(index);

        let value2: VectorObjectClass = this.tail.value;

        let newZ = value2.getZ() + 1;
        value.setZ(newZ);

        this.insert(value);

        return [{
            id: value.getId(),
            z: value.getZ()
        }]
    }
}