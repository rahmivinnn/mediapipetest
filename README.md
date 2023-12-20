<div align="justify"> 

# Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation

This repository comprises the datasets and source code developed during the work described in *Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation*.

**Abstract:** Musculoskeletal conditions affect millions of people globally, however, conventional treatments pose challenges concerning price, accessibility, and convenience. Many telerehabilitation solutions offer an engaging alternative but rely on complex hardware for body tracking. This work explores the feasibility of models for 3D Human Pose Estimation (HPE) from monocular 2D videos (MediaPipe Pose) in a physiotherapy context, by comparing its performance to ground truth measurements. MediaPipe Pose was investigated in eight exercises typically performed in musculoskeletal physiotherapy sessions, where the Range of Motion (ROM) of the human joints was the evaluated parameter. This model showed the best performance for shoulder abduction, shoulder press, elbow flexion, and squat exercises (MAPE ranging between 14.9% and 25.0%, Pearson’s coefficient ranging between 0.963 and 0.996, and cosine similarity ranging between 0.987 and 0.999). Some exercises (e.g. seated knee extension and shoulder flexion) posed challenges due to unusual poses, occlusions and depth ambiguities, possibly related to a lack of training data.  This study demonstrates the potential of HPE from monocular 2D videos, as a markerless, affordable and accessible solution for musculoskeletal telerehabilitation approaches. Future work should focus on exploring variations of the 3D HPE models trained on physiotherapy-related datasets, such as the Fit3D dataset, and post-preprocessing techniques to enhance the model's performance.


## Datasets

The project included the acquisition of two datasets (ground truth dataset and predicted dataset) during the execution of eight exercises typically used in musculoskeletal telerehabilitation (and conventional) sessions:

(1) The **ground truth dataset** (data_pos_qualisys) was collected using Qualisys, a gold-standard motion capture system. Six markers were placed in anatomical regions on the right side of the participant's body close to the shoulder, elbow, wrist, hip, knee, and ankle. Qualisys measured the 3D position of the six markers.

(2) The **predicted dataset** (data_pos_mediapipe) was estimated by MediaPipe Pose, a state-of-the-art 3D HPE algorithm. The 3D position of twelve human joints (shoulders, elbows, wrists, hips, knees, and ankles) was estimated by the algorithm from monocular 2D videos.

| Exercises | Exercises |
| --- | --- |
| 1. Shoulder Flexion/Extension  | 5. Hip Abduction/Adduction |
| 2. Shoulder Abduction/Adduction | 6. Squat  |
| 3. Elbow Flexion/Extension  | 7. March |
| 4. Shoulder Press | 8. Seated Knee Flexion/Extension |

The data is available at [datasets drive](https://ulisboa-my.sharepoint.com/:f:/g/personal/ist192800_tecnico_ulisboa_pt/ErvBBiLzAKNNra0SGisPDFQBOHurjrFOq8FQXKAOcaGZzw?e=Vi7HCn).

Files are named according to the following identification criteria: `xy.txt`, where `x` is the subject ID and `y` is the exercise number. For example, `13.txt` is the acquisition of `subject 1` performing `exercise 3` (i.e. `elbow flexion`).


## License

This project is released under BSD 3-clause License - see the [LICENSE](LICENSE) file for details

</div>

## Citation
Please use the following if you need to cite this repository:
* Clemente C, Chambel G, Silva DCF, Montes AM, Pinto JF, Silva HP, **Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation**, 2023, [https://github.com/carolinaclemente00/3D-HPE-MediaPipe-Pose](https://github.com/carolinaclemente00/3D-HPE-MediaPipe-Pose) [Online; accessed <year>-<month>-<day>].
```
@Misc{,
  author = {Carolina Clemente and Gon{\c{c}}alo Chambel and Diogo C. F. Silva and Ant{\'o}nio Mesquita Montes and Joana F. Pinto and Hugo Pl{\'a}cido da Silva},
  title = {{Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation}},
  year = {2023},
  url = "https://github.com/carolinaclemente00/3D-HPE-MediaPipe-Pose",
  note = {[Online; accessed <today>]}
}
```

<div align="justify"> 
  
## Disclamer
This program is distributed in the hope it will be useful and provided to you "as is", but WITHOUT ANY WARRANTY, without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. This program is NOT intended for medical diagnosis. We expressly disclaim any liability whatsoever for any direct, indirect, consequential, incidental or special damages, including, without limitation, lost revenues, lost profits, losses resulting from business interruption or loss of data, regardless of the form of action or legal theory under which the liability may be asserted, even if advised of the possibility of such damages.


</div>
