import numpy as np
from fractions import Fraction

to_fraction = np.vectorize(lambda x: Fraction(x))

USE_FRACTION = True


class Polynomial:
    def __init__(self, *args):
        if len(args) > 0:
            if len(args) == 1 and type(args[0]) is np.ndarray:
                self.degree = len(args[0]) - 1
                self.coefficients = args[0]
            else:
                self.degree = len(args) - 1
                if USE_FRACTION:
                    self.coefficients = np.array(list(map(Fraction, args)))
                else:
                    self.coefficients = np.array(list(map(float, args)))
        else:
            self.degree = 0
            self.coefficients = np.array([0])
        self.normalize()

    def val(self, x):
        return np.polyval(self.coefficients[::-1], x)

    def normalize(self):
        while self.degree > 0 and self.coefficients[-1] == 0:
            self.coefficients = np.delete(self.coefficients, -1)
            self.degree -= 1

    def __add__(self, other):
        return Polynomial(np.polyadd(self.coefficients[::-1], other.coefficients[::-1])[::-1])

    def __sub__(self, other):
        return Polynomial(np.polysub(self.coefficients[::-1], other.coefficients[::-1])[::-1])

    def __mul__(self, other):
        if type(other) is Polynomial:
            return Polynomial(np.polymul(self.coefficients[::-1], other.coefficients[::-1])[::-1])
        return Polynomial(self.coefficients * other)

    def __truediv__(self, other):
        return Polynomial(self.coefficients / other)

    def __eq__(self, other):
        return self.coefficients == other.coefficients

    def __str__(self):
        print(self.coefficients)
        p = [(
                 '{}*x^{}'.format(round(float(a), 5), i) if abs(a) != 1
                 else
                 (
                     'x^{}'.format(i) if a == 1
                     else
                     '-x^{}'.format(i)
                 )
             ) if i > 0 else str(round(float(a), 5))
             for i, a in enumerate(self.coefficients) if abs(a) > 0.00001 or self.degree == 0]
        return 'P[n={}, {}]'.format(self.degree, '+'.join(p[::-1]).replace('+-', '-').replace('^1', ''))


def lagrange_polynomial(x, y):
    polynomial = Polynomial()
    for i in range(len(x)):
        polynomial = polynomial + lagrange_basis_polynomial(x, i) * y[i]
    return polynomial


def lagrange_basis_polynomial(x, index):
    basis = Polynomial(1)
    for i in range(len(x)):
        if i != index:
            basis = basis * (Polynomial(-x[i], 1) / (x[index] - x[i]))
    return basis


if __name__ == '__main__':
    res = lagrange_polynomial([-1, 1, 2], [1, 3, 7])
    res = lagrange_polynomial([1, 2, 3, 4, 5, 6, 7, 8, 9], [2, 3, 2, 4, 7, 2, 3, 4, 1])
    print(res)
