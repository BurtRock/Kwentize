from flask import Flask, request, make_response, jsonify
from flask_cors import CORS

import requests
import time
from rembg import remove, new_session

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "API is working!"


@app.route("/remove", methods=["POST", "OPTIONS"])
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
