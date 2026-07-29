import { useRef, useState } from "react";
import { uploadPDF } from "../services/api";

interface UploadBoxProps {
    onUploadSuccess: (data: any) => void;
}

const UploadBox = ({ onUploadSuccess }: UploadBoxProps) => {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        if (event.target.files && event.target.files.length > 0) {

            setSelectedFile(event.target.files[0]);

        }

    };

    const handleUpload = async () => {

        if (!selectedFile) {

            alert("Please select a PDF.");

            return;

        }

        try {

            setLoading(true);

            const response = await uploadPDF(selectedFile);

console.log("API Response:", response);

onUploadSuccess(response);

            alert("Policy Uploaded Successfully!");

        }
        catch (error) {

            console.error(error);

            alert("Upload Failed");

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="w-full max-w-2xl mx-auto">

            <div className="rounded-2xl border-2 border-dashed border-purple-500 bg-[#171717] p-10">

                <h2 className="text-2xl font-bold text-center text-white">

                    Upload Legal Policy

                </h2>

                <p className="text-center text-gray-400 mt-3">

                    Upload a Privacy Policy, Terms & Conditions or Cookie Policy PDF.

                </p>

                <div className="mt-8 flex justify-center">

                    <button

                        onClick={handleChooseFile}

                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition"

                    >

                        Choose PDF

                    </button>

                </div>

                <input

                    type="file"

                    accept=".pdf"

                    ref={fileInputRef}

                    onChange={handleFileChange}

                    className="hidden"

                />

                {

                    selectedFile &&

                    <div className="mt-6 text-center">

                        <p className="text-green-400">

                            Selected:

                        </p>

                        <p className="text-white mt-2">

                            {selectedFile.name}

                        </p>

                    </div>

                }

                <div className="flex justify-center mt-8">

                    <button

                        disabled={loading}

                        onClick={handleUpload}

                        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-white"

                    >

                        {

                            loading

                                ? "Analyzing..."

                                : "Analyze Policy"

                        }

                    </button>

                </div>

            </div>

        </div>

    );

};

export default UploadBox;