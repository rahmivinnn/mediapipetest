<div align="justify"> 

# Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation

This repository comprises the datasets and source code developed during the work described in *Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation*.

**Abstract:** Musculoskeletal conditions affect millions of people globally, however, conventional treatments pose challenges concerning price, accessibility, and convenience. Many telerehabilitation solutions offer an engaging alternative but rely on complex hardware for body tracking. This work explores the feasibility of models for 3D Human Pose Estimation (HPE) from monocular 2D videos (MediaPipe Pose) in a physiotherapy context, by comparing its performance to ground truth measurements. MediaPipe Pose was investigated in eight exercises typically performed in musculoskeletal physiotherapy sessions, where the Range of Motion (ROM) of the human joints was the evaluated parameter. This model showed the best performance for shoulder abduction, shoulder press, elbow flexion, and squat exercises (MAPE ranging between 14.9% and 25.0%, Pearson’s coefficient ranging between 0.963 and 0.996, and cosine similarity ranging between 0.987 and 0.999). Some exercises (e.g. seated knee extension and shoulder flexion) posed challenges due to unusual poses, occlusions and depth ambiguities, possibly related to a lack of training data.  This study demonstrates the potential of HPE from monocular 2D videos, as a markerless, affordable and accessible solution for musculoskeletal telerehabilitation approaches. Future work should focus on exploring variations of the 3D HPE models trained on physiotherapy-related datasets, such as the Fit3D dataset, and post-preprocessing techniques to enhance the model's performance.


## Datasets

The project included the acquisition of two datasets during the execution of eight exercises:
* **Ground truth data**: acquisition by a gold-standard motion capture system: Qualisys. Measured the 3D position of six markers, corresponding to six anatomical positions.
* **Predicted data**: prediction by a 3D HPE algorithm: MediaPipe Pose. Measured the 3D central position of twelve human joints.

The data is available at [datasets drive](https://ulisboa-my.sharepoint.com/:f:/g/personal/ist192800_tecnico_ulisboa_pt/ErvBBiLzAKNNra0SGisPDFQBOHurjrFOq8FQXKAOcaGZzw?e=Vi7HCn).

Files are named according to the following identification criteria: xy.txt, where x is the subject ID and y is the exercise number. For example, 13.txt is the acquisition of subject 1 performing exercise 3 (i.e. elbow flexion).

## License

This project is released under BSD 3-clause License - see the [LICENSE](LICENSE) file for details

## Citation
Please use the following if you need to cite this repository:
* Clemente C, Chambel G, Silva DCF, Montes AM, Pinto JF,  Pinto, Silva HP, Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation, 2023, https://github.com/PIA-Group/BioSPPy/ [Online; accessed <year>-<month>-<day>].
```
@Misc{,
  author = {Carolina Clemente and Gon{\c{c}}alo Chambel and Diogo C. F. Silva and Ant{\'o}nio Mesquita Montes and Joana F. Pinto and Hugo Pl{\'a}cido da Silva},
  title = {{Feasibility of 3D Body Tracking from Monocular 2D Video Feeds in Musculoskeletal Telerehabilitation}},
  year = {2023},
  url = "https://github.com/carolinaclemente00/3D-HPE-MediaPipe-Pose.git",
  note = {[Online; accessed <today>]}
}
```


</div>

