import argparse
import time
from pathlib import Path
import cv2
import mediapipe as mp
import glob
import re
from torch import cuda



def detect(opt):
    #t0 = time.time()
    mode, complexity, source, smooth_lmks, segment, smooth_segment, conf_detect, conf_track, device, view, \
    save_txt, nbb, two_d, norm, real_world, short, start_frame, stop_frame = opt.mode, opt.complexity, \
                    opt.source, opt.smooth_lmks, opt.segmentation, opt.smooth_segmentation, opt.conf_detect, \
                    opt.conf_track, opt.device, opt.view, opt.save_txt, opt.nobbox, opt.two_d, opt.norm,\
                    opt.real_world, opt.short, opt.start_frame, opt.stop_frame

    # source type
    is_img = source.endswith(('.jpg', '.jpeg', '.png'))
    is_video = source.endswith(('.mp4', '.m2ts', '.AVI', '.avi'))
    is_webcam = source.isnumeric() or source.endswith('.txt') or source.lower().startswith(
        ('rtsp://', 'rtmp://', 'http://', 'https://'))


    # Define output filenames
    filename_conf = source[:-4] + '_conf.txt'  # name txt file
    filename_pos = source[:-4] + '_pos.txt'
    filename_pos_w = source[:-4] + '_pos_w.txt'


    # Directories
    source_dir = 'input\\' + source
    save_dir = increment_path(Path('runs\detect') / 'exp', exist_ok=False)  # increment run
    (save_dir / 'labels').mkdir(parents=True, exist_ok=True)  # make dir

    t0 = time.time()

    # Model
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
    mp_pose = mp.solutions.pose

    #t0 = time.time()
    startTime = 0

    with mp_pose.Pose(mode, complexity, smooth_lmks, segment, smooth_segment, conf_detect, conf_track) as pose:
        # For static images:
        if is_img:
            image = cv2.imread(source_dir)
            image_height, image_width, _ = image.shape
            # Convert the BGR image to RGB before processing.
            t1 = time_synchronized()
            results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            t2 = time_synchronized()

            # Print time (inference)
            print(f'Done. ({t2 - t1:.3f}s)')

            if not results.pose_landmarks:
                print('No keypoints detected!')


            # Save kpts and conf
            list_kpts = []
            list_conf = []

            for landmark in results.pose_landmarks.landmark:
                # x = landmark.x, y = landmark.y, z = landmark.z, conf = landmark.visibility
                list_kpts.append(landmark.x)
                list_kpts.append(landmark.y)
                list_kpts.append(landmark.z)
                list_conf.append(landmark.visibility)

            with open(str(save_dir) + '\labels\\' + filename_pos, 'a') as f:
                f.write(' '.join(str(x) for x in list_kpts) + '\n')

            with open(str(save_dir) + '\labels\\' + filename_conf, 'a') as f:
                f.write(' '.join(str(x) for x in list_conf) + '\n')

            annotated_image = image.copy()
            mp_drawing.draw_landmarks(
                annotated_image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())

            cv2.imwrite(str(save_dir) + '\\' + source + '.png', annotated_image)

            # Plot pose world landmarks.
            mp_drawing.plot_landmarks(results.pose_world_landmarks, mp_pose.POSE_CONNECTIONS)

            # Save kpts and conf (world coordinates)
            list_kpts_w = []

            for landmark_w in results.pose_world_landmarks.landmark:
                # x = landmark.x, y = landmark.y, z = landmark.z, conf = landmark.visibility
                list_kpts_w.append(landmark_w.x)
                list_kpts_w.append(landmark_w.y)
                list_kpts_w.append(landmark_w.z)

            with open(str(save_dir) + '\labels\\' + filename_pos_w, 'a') as f:
                f.write(' '.join(str(x) for x in list_kpts_w) + '\n')



        # For video/webcam input:
        else:

            if is_video:
                cap = cv2.VideoCapture(source_dir)
                print('is_video')

            elif is_webcam:
                cap = cv2.VideoCapture(0)

            else:
                print('Choose a different source.')


            frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps_video = cap.get(cv2.CAP_PROP_FPS)
            print('fps_video', fps_video)

            frame_count = 0
            list_frames = []
            inferences = 0

            # Initialize OpenCV VideoWriter
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            if is_video:
                out = cv2.VideoWriter(str(save_dir) + '\\' + source[:-5] + '.mp4', fourcc, fps_video, (frame_width, frame_height))
            else:
                out = cv2.VideoWriter(str(save_dir) + '\\' + 'webcam.mp4', fourcc, 10, (frame_width, frame_height))


            while cap.isOpened():
                success, image = cap.read()
                if not success:
                    print("Ignoring empty camera frame.")
                    # If loading a video, use 'break' instead of 'continue'.
                    # continue
                    break
                frame_count += 1
                list_frames += [frame_count]
                # To improve performance, optionally mark the image as not writeable to pass by reference.
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

                t1 = time_synchronized()
                results = pose.process(image)
                t2 = time_synchronized()
                inference = t2 - t1
                inferences += inference

                # Print time (inference)
                print(f'{frame_count} Done. ({inference:.3f}s)')

                currentTime = time.time()
                fps = 1 / (currentTime - startTime)
                startTime = currentTime
                cv2.putText(image, "FPS : " + str(int(fps)), (20, 70), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)

                list_kpts = []
                list_conf = []

                if not results.pose_landmarks:
                    print('No keypoints detected!')
                    list_kpts += [None]
                    list_conf += [None]
                    continue

                else:

                    if frame_count >= start_frame and frame_count <= stop_frame:

                        # Save kpts and conf
                        if real_world:
                            for i, landmark in enumerate(results.pose_world_landmarks.landmark):

                                if short:
                                    if i in [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]:
                                        list_kpts.append(landmark.x)
                                        list_kpts.append(landmark.y)
                                        list_kpts.append(landmark.z)
                                        list_conf.append(landmark.visibility)

                                else:
                                    list_kpts.append(landmark.x)
                                    list_kpts.append(landmark.y)
                                    list_kpts.append(landmark.z)
                                    list_conf.append(landmark.visibility)

                        else:

                            for i, landmark in enumerate(results.pose_landmarks.landmark):

                                if two_d:
                                    if i in [0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]: #confirmar que está bem
                                        if norm:
                                            list_kpts.append(landmark.x)
                                            list_kpts.append(landmark.y)
                                            list_conf.append(landmark.visibility)

                                        else:
                                            list_kpts.append(landmark.x * frame_width)
                                            list_kpts.append(landmark.y * frame_height)
                                            list_conf.append(landmark.visibility)

                                else:
                                    list_kpts.append(landmark.x)
                                    list_kpts.append(landmark.y)
                                    list_kpts.append(landmark.z)
                                    list_conf.append(landmark.visibility)

                        with open(str(save_dir) + '\labels\\' + filename_pos, 'a') as f:
                            f.write(str(frame_count) + ' ' + ' '.join(str(x) for x in list_kpts) + '\n')

                        with open(str(save_dir) + '\labels\\' + filename_conf, 'a') as f:
                            f.write(' '.join(str(x) for x in list_conf) + '\n')

                        # Draw the pose annotation on the image.
                        image.flags.writeable = True
                        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                        mp_drawing.draw_landmarks(
                            image,
                            results.pose_landmarks,
                            mp_pose.POSE_CONNECTIONS,
                            landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())


                        cv2.imshow('MediaPipe Pose', image)

                        out.write(image)

                        if cv2.waitKey(5) & 0xFF == 27:
                            break
            cap.release()

        #cv2.destroyAllWindows()

    print(f'Avg_inference ({inferences/frame_count:.3f}s)')
    print(f'Done. ({time.time() - t0:.3f}s)')


def time_synchronized():
    # pytorch-accurate time
    if cuda.is_available():
        cuda.synchronize()
    return time.time()

def increment_path(path, exist_ok=False, sep='', mkdir=False):
    # Increment file or directory path, i.e. runs/exp --> runs/exp{sep}2, runs/exp{sep}3, ... etc.
    path = Path(path)  # os-agnostic
    if path.exists() and not exist_ok:
        suffix = path.suffix
        path = path.with_suffix('')
        dirs = glob.glob(f"{path}{sep}*")  # similar paths
        matches = [re.search(rf"%s{sep}(\d+)" % path.stem, d) for d in dirs]
        i = [int(m.groups()[0]) for m in matches if m]  # indices
        n = max(i) + 1 if i else 2  # increment number
        path = Path(f"{path}{sep}{n}{suffix}")  # update path
    dir = path if path.suffix == '' else path.parent  # directory
    if not dir.exists() and mkdir:
        dir.mkdir(parents=True, exist_ok=True)  # make directory
    return path


def time_synchronized():
    # pytorch-accurate time
    if cuda.is_available(): #always False when running on the CPU
        cuda.synchronize()
    return time.time()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', type=bool, default=False, help='static_image_mode, deactivate/activate detector')
    parser.add_argument('--complexity', type=int, default=1,
                        help='model_complexity: 0, 1 or 2 (increasing accuracy, slower')
    parser.add_argument('--source', type=str, default='input\\', help='source path, or 0 for webcam')
    #parser.add_argument('--source_type', type=str, default='video', help='source type: img, video, webcam')
    parser.add_argument('--smooth_lmks', type=bool, default=True, help='smooth_landmarks')
    parser.add_argument('--segmentation', type=bool, default=False, help='enable_segmentation')
    parser.add_argument('--smooth_segmentation', type=bool, default=True, help='smooth_segmentation')
    parser.add_argument('--conf_detect', type=float, default=0.5, help='min_detection_confidence')
    parser.add_argument('--conf_track', type=float, default=0.5, help='min_tracking_confidence')
    parser.add_argument('--device', default='', help='cuda device, i.e. 0 or 0,1,2,3 or cpu')
    parser.add_argument('--view', action='store_true', help='display results')
    parser.add_argument('--save-txt', action='store_true', help='save results to *.txt')
    parser.add_argument('--nobbox', action='store_true', help='do not show bounding box around the person')
    parser.add_argument('--two_d', action='store_true', help='saves 2d (only 17 joints) or 3d coordinates')
    parser.add_argument('--real_world', action='store_true', help='saves 3d real world coordinates')
    parser.add_argument('--norm', action='store_true', help='normalize coordinates')
    parser.add_argument('--short', action='store_true', help='save only the 12 main joints')
    parser.add_argument('--start_frame', type=int, default=1, help='starting frame used to define the 3 planes default=1 (first frame)')
    parser.add_argument('--stop_frame', type=int, default=10000, help='stoping frame, when None it does not stops before the end of the video')

    opt = parser.parse_args()
    print(opt)
    detect(opt=opt)
