export class Color {
    hex: string;
    r: number | null = 255;
    g: number | null = 255;
    b: number | null = 255;

    constructor(hex: string = '#FFFFFF') {
        this.hex = hex;
    }

    syncHexWithRGB(): void {
        const hex = this.hex.substr(1).toUpperCase();

        const arr = [];
        // tslint:disable-next-line:no-inferrable-types  2 lint error contraire
        const HEX_BASE: number = 16;
        for (let i = 0; i < hex.length / 2; i++) {
            const temp = hex.substr(2 * i, 2);
            arr.push(HEX_BASE * this.hexLetterToDec(temp.substr(0, 1)) + this.hexLetterToDec(temp.substr(1, 1)));
        }
        this.r = arr[0];
        this.g = arr[1];
        this.b = arr[2];
    }

    syncRGBWithHex(): void {
        this.hex = '#' + this.numberToHex(Number(this.r)) + this.numberToHex(Number(this.g)) + this.numberToHex(Number(this.b));
    }

    hexLetterToDec(letter: string): number {
        const ascii = letter.charCodeAt(0);
        if (ascii >= '0'.charCodeAt(0) && ascii <= '9'.charCodeAt(0)) {
            return (ascii - '0'.charCodeAt(0));
        }
        // tslint:disable-next-line:no-inferrable-types  2 lint error contraire
        const DEC_BASE: number = 10;
        return (ascii - 'A'.charCodeAt(0)) + DEC_BASE;
    }

    charHex(val: number): string {
        // tslint:disable-next-line:no-inferrable-types  2 lint error contraire
        const DEC_BASE: number = 10;
        if (val <= DEC_BASE - 1) {
            return val.toString();
        }
        return String.fromCharCode(val - DEC_BASE + 'A'.charCodeAt(0));
    }

    numberToHex(nb: number): string {
        // tslint:disable-next-line:no-inferrable-types  2 lint error contraire
        const HEX_BASE: number = 16;
        // nb : is the value between 0 and 255 that is going to output the color in hex format
        return this.charHex(Math.floor(nb / HEX_BASE)) + this.charHex(nb % HEX_BASE);
    }

}
