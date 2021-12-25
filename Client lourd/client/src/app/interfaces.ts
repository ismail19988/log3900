export interface UtilsService {

    mouseDown(event: MouseEvent): void;
    mouseUp(event: MouseEvent): void;
    mouseMove(event: MouseEvent): void;
    mouseLeave(event: MouseEvent): void;
    doubleClick(event: MouseEvent): void;

    // keybord too
    keyDown(event: KeyboardEvent): void;
    keyUp(event: KeyboardEvent): void;
}
