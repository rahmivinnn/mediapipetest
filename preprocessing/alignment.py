
from scipy.signal import find_peaks
from functions_general import *
from functions_pos2amplitude import *



def align_mp_qualisys(mp_dir, qualisys_dir, save_dir, save_plot):
    # Get frames, time (converted from frames anf fps), amplitudes, exercise and subject info and fps for mediapipe
    mp_frames, mp_time, mp_amplitudes, mp_general_id, mp_fps = mp_pos2list_amplitudes(mp_dir, save_dir, save_plot=True)

    # Get frames, time (converted from frames and fps), amplitudes, exercise and subject info and fps for qualisys
    qualisys_frames, qualisys_time, qualisys_amplitudes,\
    qualisys_general_id, qualisys_fps = qualisys_pos2list_amplitudes(qualisys_dir, save_dir, save_plot=True)


    # Set general ID (subject ID + execise number)
    if mp_general_id == qualisys_general_id:
        general_id = mp_general_id
        subject_id = general_id[0]
        exercise_nb = general_id[1]
        exercise_name = nb2name(exercise_nb)
    else:
        print('The IDs do not match. Verify the directories of Mediapipe and Qualisys files.')


    # Find the indexes of the peak amplitudes


    # Find the 'height' for which the number of peaks of mp and qualisys is the same
    # for general ID 56 and 78, 'height' had to be chosen manually (save_height = 30 and save_height = 40, respect.)
    if general_id == 56:
        save_height = 30

    elif general_id == 78:
        save_height = 40

    else:
        save_height = 0
        for h in range(0, 110, 5):
            mp_peaks_ind, _ = find_peaks(mp_amplitudes, height=h, prominence=15)
            qualisys_peaks_ind, _ = find_peaks(qualisys_amplitudes, height=h, prominence=15)
            if len(mp_peaks_ind) == len(qualisys_peaks_ind):
                save_height = h
                break

    mp_peaks_ind, _ = find_peaks(mp_amplitudes, height=save_height, prominence=15)
    qualisys_peaks_ind, _ = find_peaks(qualisys_amplitudes, height=save_height, prominence=15)

    # Try the best combination of peak alignment
    previous_pearson_coef = 0
    length = min(len(qualisys_peaks_ind), len(mp_peaks_ind))
    for number in range(length):

        # Get 1st amplitude peak index, find corresponding time in seconds
        mp_peak1 = mp_peaks_ind[number]
        mp_peak1_time = mp_time[mp_peak1]

        qualisys_peak1 = qualisys_peaks_ind[number]
        qualisys_peak1_time = qualisys_time[qualisys_peak1]


        # Calculate the time shift between the first amplitude peaks of mediapipe and qualisys
        time_shift = mp_peak1_time - qualisys_peak1_time

        # Add time shift to list of time of qualisys to aligned qualisys and mediapipe
        qualisys_time_aligned = [round(t + time_shift, 2) for t in qualisys_time]

        # Save indexes from corresponding frames_old/time
        qualisys_matching_indexes = []
        mp_matching_indexes = []
        for i, time in enumerate(mp_time):
            if time in qualisys_time_aligned:
                qualisys_matching_indexes.append(qualisys_time_aligned.index(time))
                mp_matching_indexes.append(i)

        # Get list for indexes of corresponding frames/time
        mp_matching_amplitudes = [mp_amplitudes[i] for i in mp_matching_indexes]
        qualisys_matching_amplitudes = [qualisys_amplitudes[i] for i in qualisys_matching_indexes]


        pearson_coef = np.corrcoef(mp_matching_amplitudes, qualisys_matching_amplitudes)[0][1]

        if pearson_coef > previous_pearson_coef:
            previous_pearson_coef = pearson_coef
            save_number = number
        
    if general_id == 78:
        save_number = -4
    if general_id == 87:
        save_number = 0

    # Get amplitude peak index of the peak that allowed better Pearson's coefficient, find corresponding time in seconds
    mp_peak1 = mp_peaks_ind[save_number]
    mp_peak1_time = mp_time[mp_peak1]
    
    qualisys_peak1 = qualisys_peaks_ind[save_number]
    qualisys_peak1_time = qualisys_time[qualisys_peak1]

    
    # Calculate the time shift between the first amplitude peaks of mediapipe and qualisys
    time_shift = mp_peak1_time - qualisys_peak1_time

    # Add time shift to list of time of qualisys to aligned qualisys and mediapipe
    qualisys_time_aligned = [round(t + time_shift, 2) for t in qualisys_time]

    # Save indexes from corresponding frames_old/time
    qualisys_matching_indexes = []
    mp_matching_indexes = []
    for i, time in enumerate(mp_time):
        if time in qualisys_time_aligned:
            qualisys_matching_indexes.append(qualisys_time_aligned.index(time))
            mp_matching_indexes.append(i)

    if len(qualisys_matching_indexes) == len(mp_matching_indexes):
        print('List of indexes of corresponding frames_old/time have the save length.')

    # Get list for indexes of corresponding frames/time
    mp_matching_amplitudes = [mp_amplitudes[i] for i in mp_matching_indexes]
    qualisys_matching_amplitudes = [qualisys_amplitudes[i] for i in qualisys_matching_indexes]

    aligned_time = mp_time[:len(mp_matching_amplitudes)]

    pearson_coef = np.corrcoef(mp_matching_amplitudes, qualisys_matching_amplitudes)[0][1]
    print('The Pearson coefficient is ' + str(pearson_coef) + '.')

    save_parameters = [pearson_coef, save_height, save_number]
    with open(save_dir + str(general_id) + '_amplitudes_aligned.txt', 'a') as f:
        f.write(' '.join(str(p) + ',' for p in save_parameters))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(s) + ',' for s in aligned_time))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(m) + ',' for m in mp_matching_amplitudes))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(q) + ',' for q in qualisys_matching_amplitudes))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(q) + ',' for q in mp_matching_indexes))
        f.write('\n')
        f.write('\n')
        f.write(' '.join(str(q) + ',' for q in qualisys_matching_indexes))
    print('Saving Done.')

    if save_plot:
        loc = 'outside right upper'

        fig, ax = plt.subplots(figsize=(6, 4), layout='constrained')

        plt.plot(aligned_time, qualisys_matching_amplitudes, label='Qualisys', color='C1')
        plt.plot(aligned_time, mp_matching_amplitudes, label='MediaPipe', color='C0', alpha=0.9)

        plt.title('Subject ' + str(subject_id) + ':' + '\n' + exercise_name)
        plt.xlim(0, )
        plt.xlabel('Time (seconds)')
        plt.ylabel('Amplitude (degrees)')
        fig.legend(loc=loc)
        #plt.figtext(.8, .8, "r = " + str(round(pearson_coef, 4)))
        plt.savefig(save_dir + str(general_id) + '_.png', dpi=300)
        #plt.show()
        plt.close()
