from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import requests
import time
from rembg import remove, new_session


app = Flask(__name__)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["2 per day"],
    storage_uri="memory://",
)

CORS(app)


@app.route("/")
@limiter.exempt
def hello():
    return "API is working!"


@app.route("/share/<cid>")
@limiter.exempt
def share(cid):
    return (
        '<html><head><meta name="twitter:card" content="summary_large_image" /><meta property="og:url" content="https://'
        + cid
        + '.ipfs.nftstorage.link" /><meta property="og:title" content="Kwentize yourself" /><meta property="og:description" content="Kwentize yourself with our tool." /><meta property="og:image" content="https://'
        + cid
        + '.ipfs.nftstorage.link" /></head><body>redirecting to image..</body><script>setTimeout(function(){ window.location.href = "https://'
        + cid
        + '.ipfs.nftstorage.link"; }, 200)</script></html>'
    )


@app.route("/remove", methods=["POST", "OPTIONS"])
@limiter.exempt
def remove_bg():
    content_type = request.headers.get("Content-Type")
    if content_type == "application/json":
        json = request.json
        now = str(time.time())
        url = json["url"]
        data = requests.get(url).content
        f = open("./origin/" + now + ".jpg", "wb")
        f.write(data)
        f.close()

        input_path = "./origin/" + now + ".jpg"
        output_path = "./static/" + now + ".png"
        res = {}
        res["result"] = now + ".png"
        with open(input_path, "rb") as i:
            with open(output_path, "wb") as o:
                input = i.read()
                model_name = "u2net_human_seg"
                session = new_session(model_name)
                output = remove(input, session=session)
                o.write(output)
        return jsonify(res)
    else:
        return "Content-Type not supported!"


@app.route("/remove-bg-2", methods=["POST", "OPTIONS"])
@limiter.limit("4 per day", override_defaults=True)
def remove_bg2():
    content_type = request.headers.get("Content-Type")
    if content_type == "application/json":
        json = request.json
        now = str(time.time())
        url = json["url"]
        data = requests.get(url).content
        f = open("./origin/" + now + ".jpg", "wb")
        f.write(data)
        f.close()
        res = {}
        res["result"] = now + ".png"

        input_path = "./origin/" + now + ".jpg"
        output_path = "./static/" + now + ".png"

        response = requests.post(
            "https://api.remove.bg/v1.0/removebg",
            files={"image_file": open(input_path, "rb")},
            data={"size": "auto"},
            headers={"X-Api-Key": "N7ofK6rsQTtk3oKPbpDM3dV3"},
        )
        if response.status_code == requests.codes.ok:
            with open(output_path, "wb") as out:
                out.write(response.content)
                return jsonify(res)
        else:
            print("Error:", response.status_code, response.text)
            return response.text
    else:
        return "Content-Type not supported!"
