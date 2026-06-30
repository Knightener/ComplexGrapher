
export default class Complex {

    constructor(re, im = 0) {
        this.re = re;
        this.im = im;
    }

    add(z) {
        return new Complex(this.re + z.re, this.im + z.im);
    }

    sub(z) {
        return new Complex(this.re - z.re, this.im - z.im);
    }

    mul(z) {
        return new Complex(
            this.re * z.re - this.im * z.im,
            this.re * z.im + this.im * z.re
        );
    }

    scale(r) {
        return new Complex(r * this.re, r * this.im);
    }

    normSquared() {
        return this.re * this.re + this.im * this.im;
    }

    norm() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    conj() {
        return new Complex(this.re, -this.im);
    }

    div(z) {
        const normSquared = z.normSquared();
        return new Complex(
            (this.re * z.re + this.im * z.im) / normSquared,
            (this.im * z.re - this.re * z.im) / normSquared
        );
    }

    arg() {
        return Math.atan2(this.im, this.re);
    }

    exp() {
        const r = Math.exp(this.re);
        return new Complex(r * Math.cos(this.im), r * Math.sin(this.im));
    }

    sin() {
        return new Complex(
            Math.sin(this.re) * Math.cosh(this.im),
            Math.cos(this.re) * Math.sinh(this.im)
        );
    }

    cos() {
        return new Complex(
            Math.cos(this.re) * Math.cosh(this.im),
            -Math.sin(this.re) * Math.sinh(this.im)
        );
    }

    ln() {
        return new Complex(Math.log(this.norm()), this.arg());
    }

    pow(z) {
        return this.ln().mul(z).exp();
    }
}