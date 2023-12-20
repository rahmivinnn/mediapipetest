from sklearn.linear_model import LinearRegression

def linear_regression_function(data1, data2):

    reg = LinearRegression().fit(data1, data2)
    linear_reg_score = reg.score(data1, data2)
    linear_reg_slope = reg.coef_[0]
    linear_reg_intercept = reg.intercept_

    x1 = min(min(data1), min(data2))
    y1 = linear_reg_slope * x1 + linear_reg_intercept
    x2 = max(max(data1), max(data2))
    y2 = linear_reg_slope * x2 + linear_reg_intercept

    return linear_reg_score, linear_reg_slope, linear_reg_intercept, x1, x2, y1, y2