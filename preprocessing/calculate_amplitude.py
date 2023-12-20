import numpy as np


# Function to calculate the signed angle between two vectors with respect to a given axis
def signed_angle(vector1, vector2, axis):
    # Convert input vectors to NumPy arrays
    vector1 = np.array(vector1)
    vector2 = np.array(vector2)

    # Normalize the vectors to get unit vectors
    unit_vector1 = vector1 / np.linalg.norm(vector1)
    unit_vector2 = vector2 / np.linalg.norm(vector2)

    # Calculate dot product and cross product of the unit vectors
    dot_product = np.dot(unit_vector1, unit_vector2)
    cross_product = np.cross(unit_vector1, unit_vector2)

    # Calculate the angle between the vectors using arctan2
    angle = np.arctan2(np.linalg.norm(cross_product), dot_product)

    # Convert angle to degrees
    signed_angle = np.degrees(angle)

    # Check the orientation of the cross product with respect to the given axis
    if np.dot(cross_product, axis) < 0:
        signed_angle = -signed_angle

    return signed_angle


# Function to calculate the signed angle between a reference direction and the projection of the body segment vector
# onto a plane
def AngleProjected(reference_position, target_position, reference_direction, custom_normal):
    # Convert input parameters to NumPy arrays
    target_pos = np.array(target_position)
    ref_pos = np.array(reference_position)
    ref_dir = np.array(reference_direction)
    normal = np.array(custom_normal)

    # Calculate the body segment vector from reference position (joint 1) to target position (joint 2)
    vector = target_pos - ref_pos

    # Project the body segment vector onto the plane defined by the custom_normal
    projection = vector - (np.dot(vector, normal) * normal) / np.linalg.norm(normal) ** 2

    # Calculate the signed angle between the reference direction and the projection
    angle = signed_angle(ref_dir, projection, normal)

    return angle


# Function to calculate the signed angle between a reference direction and the body segment vector
# (for the squat exercise)
def AngleProjectedSquat(reference_position, target_position, reference_direction, custom_normal):
    # Convert input parameters to NumPy arrays
    target_pos = np.array(target_position)
    ref_pos = np.array(reference_position)
    ref_dir = np.array(reference_direction)
    normal = np.array(custom_normal)

    # Calculate the body segment vector from reference position (joint 1) to target position (joint 2)
    vector = target_pos - ref_pos

    # Calculate the signed angle between the reference direction and the body segment vector
    angle = signed_angle(ref_dir, vector, normal)

    return angle
