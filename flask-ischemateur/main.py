from threading import Timer
import webbrowser

from waitress import serve

from app import create_app


def main() -> None:
    app = create_app()
    host = "127.0.0.1"
    port = 5055
    url = f"http://{host}:{port}"
    Timer(1.2, lambda: webbrowser.open(url)).start()
    serve(app, host=host, port=port)


if __name__ == "__main__":
    main()
