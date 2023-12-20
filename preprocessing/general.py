import os

# Function to map exercise numbers to exercise names
def nb2name(exercise_nb):
    if exercise_nb == 1 or exercise_nb == '1':
        name = 'shoulder_flexion'
    elif exercise_nb == 2 or exercise_nb == '2':
        name = 'shoulder_abduction'
    elif exercise_nb == 3 or exercise_nb == '3':
        name = 'elbow_flexion'
    elif exercise_nb == 4 or exercise_nb == '4':
        name = 'shoulder_press'
    elif exercise_nb == 5 or exercise_nb == '5':
        name = 'shoulder_ext_rot_abduction'
    elif exercise_nb == 6 or exercise_nb == '6':
        name = 'hip_abduction'
    elif exercise_nb == 7 or exercise_nb == '7':
        name = 'squat'
    elif exercise_nb == 8 or exercise_nb == '8':
        name = 'march'
    elif exercise_nb == 9 or exercise_nb == '9':
        name = 'seated_knee_extension'
    else:
        name = None  # Default value for invalid exercise numbers
        print('You must choose a number from 1 to 9.')

    return name

# Function to extract information from a directory path
def get_info(dir):
    # Get filename
    filename = os.path.basename(dir).split('/')[-1]

    # Get general_id (subject_id + exercise_nb), subject_id, exercise_nb, and exercise_name
    general_id = int(filename[0] + filename[1])
    subject_id = int(filename[0])
    exercise_nb = int(filename[1])

    # Get name of the exercise from the respective number 1->'shoulder_flexion', 2->'shoulder_abduction', ...
    exercise_name = nb2name(exercise_nb)

    return general_id, subject_id, exercise_nb, exercise_name

# Function to calculate the midpoint between two 3D points
def midpoint(p1, p2):
    return [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2, (p1[2]+p2[2])/2]

# Function to convert a 1D list to a 2D matrix with specified number of rows and columns
def list2matrix(lst, rows, cols):
    matrix = []
    for i in range(rows):
        row = lst[i * cols: (i + 1) * cols]
        matrix.append(row)
    return matrix

# Function to convert a 2D matrix to a 1D list
def matrix2list(lst):
    new_lst = []
    for lst1 in lst:
        new_lst += lst1
    return new_lst

# Function to transpose a matrix
def matrix_transpose(lst):
    lst_transposed = [list(row) for row in zip(*lst)]
    return lst_transposed

# Function to flatten a list of lists and remove None values
def one_single_list(data_lst):
    data_lst = list(data_lst)
    one_list = []
    for lst in data_lst:
        if not(lst[0] == None):
            lst = list(lst)
            one_list += lst
    return one_list

# Weighted Average function
def weighted_average(values, weights):
    if len(values) != len(weights):
        raise ValueError("Values and weights must have the same length")

    total_weight = sum(weights)
    weighted_sum = sum(value * weight for value, weight in zip(values, weights))

    if total_weight == 0:
        raise ValueError("Total weight cannot be zero")

    return weighted_sum / total_weight

# Function to organize joint data frame by frame into a list of joints

def frame2joint(lst):
    joint_names = ['l_shoulder', 'r_shoulder', 'l_elbow', 'r_elbow', 'l_wrist', 'r_wrist',
                   'l_hip', 'r_hip', 'l_knee', 'r_knee', 'l_foot', 'r_foot']

    joints_dict = {name: [] for name in joint_names}

    for frame in lst:
        for name, slice_range in zip(joint_names, range(0, len(joint_names) * 3, 3)):
            joints_dict[name].append(frame[slice_range:slice_range + 3])

    joints_list = list(joints_dict.values())
    return joints_list


'''
def frame2joint(lst):
    # Initialize empty lists for each joint type
    l_shoulder = []
    r_shoulder = []
    l_elbow = []
    r_elbow = []
    l_wrist = []
    r_wrist = []
    l_hip = []
    r_hip = []
    l_knee = []
    r_knee = []
    l_foot = []
    r_foot = []

    # Iterate through each frame in the input list
    for frame in lst:
        l_shoulder.append(frame[:3])   # Append the first three coordinates to the left shoulder list
        r_shoulder.append(frame[3:6])  # Append the next three coordinates to the right shoulder list
        l_elbow.append(frame[6:9])
        r_elbow.append(frame[9:12])
        l_wrist.append(frame[12:15])
        r_wrist.append(frame[15:18])
        l_hip.append(frame[18:21])
        r_hip.append(frame[21:24])
        l_knee.append(frame[24:27])
        r_knee.append(frame[27:30])
        l_foot.append(frame[30:33])
        r_foot.append(frame[33:])

    # Organize the collected joint-specific lists into a new list
    joints_list = [l_shoulder, r_shoulder, l_elbow, r_elbow, l_wrist, r_wrist,
                   l_hip, r_hip, l_knee, r_knee, l_foot, r_foot]

    # Return the resulting list of lists
    return joints_list
'''