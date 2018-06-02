from flask import Flask, render_template, request, jsonify
from interpolation import lagrange_polynomial, np

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/lagrange_interpolation')
def lagrange_interpolation():
    x = np.array(list(map(float, request.args.getlist('x[]'))))
    y = np.array(list(map(float, request.args.getlist('y[]'))))
    try:
        polynomial = lagrange_polynomial(x, y)
    except ValueError as e:
        return jsonify(message=repr(e), ok=False)
    return jsonify(polynomial=list(polynomial.coefficients), ok=True)


@app.route('/lagrange_interpolation_values')
def lagrange_interpolation_values():
    x = np.array(list(map(float, request.args.getlist('x[]'))))
    y = np.array(list(map(float, request.args.getlist('y[]'))))
    if len(x) > 35:
        return jsonify(message='Too many points, maximum number of points is 35', ok=False)
    left = request.args.get('left', type=float)
    right = request.args.get('right', type=float)
    if right <= left:
        return jsonify(message='Bounds must satisfy the condition left < right', ok=False)
    step = (right - left) / request.args.get('points', type=int)
    try:
        polynomial = lagrange_polynomial(x, y)
    except ValueError as e:
        return jsonify(message=repr(e), ok=False)
    except ZeroDivisionError as e:
        return jsonify(message=repr(e), ok=False)
    xs = np.arange(left, right, step)
    ys = polynomial.val(xs)
    mx = max(y)
    mn = min(y)
    s = (mx-mn)*10
    mx += s
    mn -= s
    ys = map(lambda yy: yy if yy < mx else mx, ys)
    ys = map(lambda yy: yy if yy > mn else mn, ys)
    pol = str(polynomial)
    if len(pol) > 160:
        pol = 'Polynomial is too big to display...'
    return jsonify(x=list(xs), y=list(ys), polynomial=pol, ok=True)


if __name__ == '__main__':
    app.run()
