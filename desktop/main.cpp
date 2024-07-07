#include <QIcon>
#include <QApplication>
#include <QWebEngineView>
#include <QLabel>
#include <QMovie>
#include <QVBoxLayout>
#include <QScreen>
#include <QTimer>
#include "manage.h"


class DesktopAppAzion : public QWidget {
public:
    DesktopAppAzion() {
        QString assetPath = QApplication::applicationDirPath() + "/assets";
        QIcon appIcon(assetPath + "/icon.png");

        if (!appIcon.isNull()) {
            setWindowIcon(appIcon);
            setWindowTitle("Azion Desktop");


        } else {
            qDebug() << "Icon file not found at:" << assetPath + "/icon.png";
        }

        auto* view = new QWebEngineView(this);
        view->load(QUrl("https://ev-f.vercel.app"));

        auto* loadingAnimation = new QLabel(this);
        auto* movie = new QMovie(assetPath+"/loading.gif");
        loadingAnimation->setMovie(movie);
        movie->start();
        loadingAnimation->hide();

        auto* layout = new QVBoxLayout(this);
        layout->setMargin(0);
        layout->addWidget(view);
        layout->addWidget(loadingAnimation);
        layout->setAlignment(loadingAnimation, Qt::AlignCenter);

        // Timer setup
        auto* timer = new QTimer(this);
        timer->setSingleShot(true);
        connect(timer, &QTimer::timeout, [loadingAnimation]() {
            loadingAnimation->hide();
        });

        connect(view, &QWebEngineView::loadStarted, [loadingAnimation, timer]() {
            loadingAnimation->show();
            timer->start(5000); // Start the timer for 5 seconds
        });
        connect(view, &QWebEngineView::loadFinished, [loadingAnimation](bool) {
            loadingAnimation->hide();
        });

        QScreen* screen = QApplication::primaryScreen();
        QRect screenGeometry = screen->geometry();
        int screenWidth = screenGeometry.width();
        int screenHeight = screenGeometry.height();

        int windowWidth = screenWidth * 0.75;
        int windowHeight = screenHeight * 0.75;
        resize(windowWidth, windowHeight);

        int axisX = (screenWidth - windowWidth) / 2;
        int axisY = (screenHeight - windowHeight) / 2;

        move(axisX, axisY);
    }
};

int main(int argc, char *argv[]) {


    QApplication app(argc, argv);

    ensureAppIcon();

    DesktopAppAzion window;
    window.show();

    return app.exec();
}