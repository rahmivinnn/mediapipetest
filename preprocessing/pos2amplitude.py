import datetime
from matplotlib import pyplot as plt
import csv

from functions_general import *
from functions_calculate_amplitude import *
from functions_define_anatomical_planes import *





# Given the directory of the positions file, calculates the amplitudes and returns the amplitudes (and other information) in a list
def mp_pos2list_amplitudes(txt_dir, save_dir, save_plot):

    # Get information about subject ID, exercise number and exercise name; general_id = subject_id+exercise_nb
    general_id, subject_id, exercise_nb, name = get_info(txt_dir)

    with open(txt_dir) as file:
        txt_file = csv.reader(file, delimiter=" ")

        fps = 30.017410097856757  # fps of a video

        list_angles = []
        for l, line in enumerate(txt_file):
            # attention! index = 0 corresponds to the frame! not a position!
            l_shoulder, r_shoulder, l_elbow, r_elbow, l_wrist, r_wrist, l_hip, r_hip, \
            l_knee, r_knee, l_foot, r_foot = [[float(s) for s in line[i:i + 3]] for i in range(1, 34, 3)]

            '''
            l_shoulder = [float(s) for s in line[1:4]]
            r_shoulder = [float(s) for s in line[4:7]]
            l_elbow = [float(s) for s in line[7:10]]
            r_elbow = [float(s) for s in line[10:13]]
            l_wrist = [float(s) for s in line[13:16]]
            r_wrist = [float(s) for s in line[16:19]]
            l_hip = [float(s) for s in line[19:22]]
            r_hip = [float(s) for s in line[22:25]]
            l_knee = [float(s) for s in line[25:28]]
            r_knee = [float(s) for s in line[28:31]]
            l_foot = [float(s) for s in line[31:34]]
            r_foot = [float(s) for s in line[34:]]
            '''

            # Use the first frame to define the virtuak 3D Cartesian system
            # (normal vectors of frontal, sagittal and transversal planes)
            if l == 0:
                # Defines lists of 4 keypoints to define anatomical planes
                list4points = [l_shoulder, r_shoulder, l_hip, r_hip]

                frontal_normal = define_frontal_plane(list4points)
                if frontal_normal[2] < 0:
                    frontal_normal = [-fn for fn in frontal_normal]

                transversal_normal = define_transversal_plane(list4points)
                if transversal_normal[1] < 0:
                    transversal_normal = [-tn for tn in transversal_normal]

                sagittal_normal = define_sagittal_plane(frontal_normal, transversal_normal)
                if sagittal_normal[0] < 0:
                    sagittal_normal = [-sn for sn in sagittal_normal]

                x_direction = sagittal_normal
                y_direction = transversal_normal
                z_direction = frontal_normal

            # Define the reference position (joint 1) and the target position (joint 2), depending on the exercise
            if exercise_nb in [1, 2, 4]:
                list_pos1 = r_shoulder
                list_pos2 = r_elbow

            elif exercise_nb == 3:
                list_pos1 = r_elbow
                list_pos2 = r_wrist

            elif exercise_nb in [6, 8, 7]:
                list_pos1 = r_hip
                list_pos2 = r_knee

                if exercise_nb == 7:
                    list_pos3 = r_foot

            elif exercise_nb == 9:
                list_pos1 = r_knee
                list_pos2 = r_foot

            else:
                print('There is no exercise number!')

            # Calculate amplitudes
            # function to calculate amplitude determined angles in the range ]-180º, 180º[
            # change the range to ]-90º, 270º[ by starting the 0º at 90º, and sum +90º at the end
            if exercise_nb in [1, 3, 8, 9]:
                angle = AngleProjected(reference_position=list_pos1,
                                       target_position=list_pos2,
                                       reference_direction=-np.array(z_direction),
                                       custom_normal=-np.array(sagittal_normal))
                angle = angle + 90

            elif exercise_nb in [2, 4, 6]:
                angle = AngleProjected(reference_position=list_pos1,
                                       target_position=list_pos2,
                                       reference_direction=-np.array(x_direction),
                                       custom_normal=frontal_normal)
                angle = angle + 90

            elif exercise_nb == 7:
                ref_direction = np.array(list_pos2) - np.array(list_pos3)
                angle = AngleProjectedSquat(reference_position=list_pos2,
                                            target_position=list_pos1,
                                            reference_direction=ref_direction,
                                            custom_normal=sagittal_normal)

            list_angles.append(angle)

        list_frames = list(range(1, len(list_angles) + 1))  # reset frame counting [1, 2, ...]
        list_time = [round(frame / fps, 2) for frame in list_frames]

        # Save list of mediapipe amplitudes, list of time points and list of frames
        with open(save_dir + str(general_id) + '_' + name + '_amplitudes_mp.txt', 'a') as f:
            f.write(' '.join(str(a) + ',' for a in list_angles))
            f.write('\n')
            f.write('\n')
            f.write(' '.join(str(b) + ',' for b in list_time))
            f.write('\n')
            f.write('\n')
            f.write(' '.join(str(c) + ',' for c in list_frames))

        print('Saving Done.')

        if save_plot:
            loc = 'outside right upper'

            fig, ax = plt.subplots(figsize=(6, 4), layout='constrained')

            plt.plot(list_time, list_angles, label='Angles')

            plt.title('Subject ' + str(subject_id) + ':' + '\n' + name)
            plt.xlim(0, )
            plt.xlabel('Time (seconds)')
            plt.ylabel('Amplitude (degrees)')
            fig.legend(loc=loc)
            plt.savefig(save_dir + str(general_id) + '_' + name + '_mp.png', dpi=300)
            # plt.show()
            plt.close()

        return list_frames, list_time, list_angles, name, exercise_nb, subject_id, fps


def qualisys_pos2list_amplitudes(tsv_dir, save_dir, save_plot):

    # Get information about subject ID, exercise number and exercise name; general_id = subject_id+exercise_nb
    general_id, subject_id, exercise_nb, name = get_info(tsv_dir)

    with open(tsv_dir, 'r') as file:
        # Read tsv file
        tsv_file = csv.reader(file, delimiter="\t")

        list_angles = []
        for i, line in enumerate(tsv_file, start=-8):  # each line: list of strings, e.g. line1: ['NO_OF_FRAMES', '8804', '', ''], line9: ['6,753', '-1,466', '-83,089', '']

            tmp_list_pos1 = []
            tmp_list_pos2 = []
            tmp_list_pos3 = []

            # Get FPS
            if i == -6:
                fps = int(line[1])

            # Get position indexes
            if i == -3:
                first_ind = int(line[1][0])
                second_ind = int(line[4][0])
                indexes = [first_ind, second_ind]

                if exercise_nb == 7:
                    third_ind = int(line[7][0])
                    indexes = indexes + [third_ind]

            # Get pos
            if i >= 0:  # to exclude first lines of text
                tmp_list_pos1.append(float(line[0]))
                tmp_list_pos1.append(float(line[1]))
                tmp_list_pos1.append(float(line[2]))

                tmp_list_pos2.append(float(line[3]))
                tmp_list_pos2.append(float(line[4]))
                tmp_list_pos2.append(float(line[5]))

                list_pos = [tmp_list_pos1] + [tmp_list_pos2]

                if exercise_nb == 7:
                    tmp_list_pos3.append(float(line[6]))
                    tmp_list_pos3.append(float(line[7]))
                    tmp_list_pos3.append(float(line[8]))
                    list_pos += [tmp_list_pos3]

                min_ind = indexes.index(min(indexes))  # 3
                max_ind = indexes.index(max(indexes))  # 1
                list_pos1 = list_pos[min_ind]
                list_pos2 = list_pos[max_ind]

                if exercise_nb == 7:
                    interm_ind = [ind for ind in [0, 1, 2] if ind != min_ind and ind != max_ind][0]  # 2

                    list_pos1 = list_pos[min_ind]
                    list_pos2 = list_pos[interm_ind]
                    list_pos3 = list_pos[max_ind]

                if exercise_nb in [1, 3, 8, 9]:
                    angle, _ = AngleProjected(reference_position=list_pos1,
                                              target_position=list_pos2,
                                              reference_direction=(0, 1, 0),
                                              custom_normal=(1, 0, 0))
                    angle = angle + 90

                elif exercise_nb in [2, 4, 6]:
                    angle, _ = AngleProjected(reference_position=list_pos1,
                                              target_position=list_pos2,
                                              reference_direction=(1, 0, 0),
                                              custom_normal=(0, -1, 0))
                    angle = angle + 90

                elif exercise_nb == 7:
                    ref_direction = np.array(list_pos2)-np.array(list_pos3)
                    angle, _ = AngleProjectedSquat(reference_position=list_pos2,
                                                   target_position=list_pos1,
                                                   reference_direction=ref_direction,
                                                   custom_normal=(0, 1, 0))


                list_angles.append(angle)

    list_frames = list(range(1, len(list_angles) + 1))
    list_time = [round(frame / fps, 2) for frame in list_frames]

    # Save list of qualisys amplitudes, list of time points and list of frames
    with open(save_dir + str(subject_id) + str(exercise_nb) + '_' + name + '_amplitudes_qualisys.txt', 'a') as f:
        f.write(' '.join(str(a) + ',' for a in list_angles))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(b) + ',' for b in list_time))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(c) + ',' for c in list_frames))

    print('Saving Done.')

    if save_plot:
        loc = 'outside right upper'

        fig, ax = plt.subplots(figsize=(6, 4), layout='constrained')

        plt.plot(list_time, list_angles, label='Angles')

        plt.title('Subject ' + str(subject_id) + ':' + '\n' + name)
        plt.xlim(0, )
        plt.xlabel('Time (seconds)')
        plt.ylabel('Amplitude (degrees)')
        fig.legend(loc=loc)
        plt.savefig(save_dir + str(general_id) + '_' + name + '_qualisys.png', dpi=300)
        # plt.show()
        plt.close()

    return list_frames, list_time, list_angles, general_id, fps
