import numpy as np
from sklearn.linear_model import RANSACRegressor
from skspatial.objects import Line
from functions_general import midpoint


# Function to define the frontal plane using RANSAC regression
def define_frontal_plane(list_points):
    np.random.seed(42)

    # Convert the list of 3D points to a NumPy array
    points = np.array(list_points)

    # Extract x, y, and z coordinates from the points
    xyz = np.array(points)
    xy = xyz[:, :2]  # Extracting x and y coordinates (first two columns)
    z = xyz[:, 2]    # Extracting z coordinates (third column)

    # Fit the plane using RANSAC regression (z = ax + by + d, considering c = -1)
    ransac = RANSACRegressor()

    # Find coefficients
    ransac.fit(xy, z)
    a, b = ransac.estimator_.coef_    # coefficients
    d = ransac.estimator_.intercept_  # intercept

    # Define the normal vector to the frontal plane
    vector = [a, b, -1]

    # Normalize the vector
    norm = np.linalg.norm(vector)
    normal_vector = vector / norm

    return normal_vector


# Function to define the transversal plane using midpoints between left and right sides
def define_transversal_plane(list_points):
    np.random.seed(42)

    # Define midpoints between left and right sides
    mid_points = []
    for i in range(0, len(list_points), 2):
        mid_points += [midpoint(list_points[i], list_points[i + 1])]

    # Convert midpoints to a NumPy array
    points = np.array(mid_points)

    # Fit a line to the midpoints to define the direction of the transversal plane
    line_fit = Line.best_fit(points)
    y_vector = line_fit.direction

    # Normalize the y_vector
    norm = np.linalg.norm(y_vector)
    y_vector = y_vector / norm

    transversal_normal_vector = y_vector

    return transversal_normal_vector


# Function to define the sagittal plane based on frontal and transversal normal vectors
def define_sagittal_plane(frontal_normal_vector, transversal_normal_vector):
    # If the vectors transversal_normal_vector and frontal_normal_vector already have the right direction,
    # the sagittal normal should be positive
    sagittal_normal_vector = np.cross(transversal_normal_vector, frontal_normal_vector)

    return sagittal_normal_vector
