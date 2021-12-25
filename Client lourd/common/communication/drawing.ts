export interface DrawingIn {
    name: string;
    drawing: string[];
    labels: string[];
    timeStamp: number;
    width: number;
    height: number;
}

export interface DrawingOut {
    _id: string;
    name: string;
    drawing: string[];
    labels: string[];
    timeStamp: number;
    width: number;
    height: number;
}
