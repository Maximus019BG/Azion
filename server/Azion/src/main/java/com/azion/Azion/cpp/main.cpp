#include <jni.h>
#include <iostream>
#include <opencv2/opencv.hpp>
#include <opencv2/face.hpp>
#include "MainCaller.h"

using namespace std;
using namespace cv;
using namespace cv::face;

JNIEXPORT void JNICALL Java_MainCaller_callCppMain(JNIEnv *, jobject) {
    CascadeClassifier faceDetector;
    faceDetector.load("haarcascade_frontalface_alt.xml");

    Mat image = imread("path_to_image.jpg");
    if (image.empty()) {
        cerr << "Error loading image" << endl;
        return;
    }
    vector<Rect> faces;
    faceDetector.detectMultiScale(image, faces);
    cout << "Faces detected: " << faces.size() << endl;

    for (const Rect& rect : faces) {
        Mat face = image(rect);
        Ptr<LBPHFaceRecognizer> faceRecognizer = LBPHFaceRecognizer::create();
        MatOfFloat embeddings;
        faceRecognizer->compute(face, embeddings);

        cout << "Face embeddings size: " << embeddings.total() << endl;
    }
}