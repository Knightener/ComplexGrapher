class Complex {

    constructor(re, im = 0) {
        return { re, im };
    }

    add(z) {
        return { re: this.re + z.re, im: this.im + z.im };
    }

    sub(z) {
        return { re: this.re - z.re, im: this.im - z.im };
    }

    mul(z) {
        return { re: this.re * z.re - this.im * z.im, im: this.re * z.im + this.im * z.re };
    }

    scale(r) {
        return { re: r * this.re, im: r * z.im };
    }

    normSquared() {
        return this.re * this.re + this.im + this.im;
    }

    norm() {
        return Math.sqrt(this.re * this.re + this.im * this.im)
    }

    conj() {
        return { re: this.re, im: -this.im }
    }

    div(z) {
        const normSquared = z.normSquared();
        return { re: (this.re * z.re + this.im * z.im) / normSquared, im: (this.im * z.re - this.re * z.im) / normSquared };
    }

    arg() {
        return Math.atan2(this.im, this.re);
    }

    exp() {
        const r = Math.exp(this.re);
        return { re: r * Math.cos(this.im), im: r * Math.sin(this.im) };
    }

    sin(a) {
        return { re: Math.sin(a.re) * Math.cosh(a.im), im: Math.cos(a.re) * Math.sinh(a.im) };
    }

    cos(a) {
        return { re: Math.cos(a.re) * Math.cosh(a.im), im: -Math.sin(a.re) * Math.sinh(a.im) };
    }

    ln() {
        return { re: Math.log(this.norm), im: this.arg()}
    }

    pow(z) {
        return this.ln().mul(z).exp()
    }
}