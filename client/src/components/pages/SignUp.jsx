import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import logo from "../../assets/logo.png";

function SignUp() {
	return (
		<div className=" main-container bg-[#ebedee] flex justify-center items-center h-full w-full">
			<div className="inner-container bg-[#ffffff] h-4/5 w-4/5 rounded-[15px] flex">
				<div className="inner-left-container h-full w-1/2 p-10">
					<div>
						<img className="h-[30px]" src={logo} alt="Description" />
					</div>
					<div className="text-left pt-5">
						<div className="pt-sans-regular text-3xl">
							Compare Mutual Funds Effortlessly
						</div>
						<div className="pt-sans-regular text-[12px]">
							Sign up to make informed investment decisions with confidence!
						</div>
					</div>
					<div className="mt-5 h-[35px] w-full border-2 border-solid border-[#e1e1e1] rounded-md flex items-center justify-center">
						<FcGoogle />{" "}
						<span className="pl-3 text-[12px]"> Sign in with Google</span>
					</div>
					<div className="mt-5 flex items-center">
						<div className="mt-1 h-[2px] w-1/2 bg-[#e1e1e1]"></div>
						<span className="text-[12px] ml-[5px] mr-[5px]">or</span>
						<div className="mt-1 h-[2px] w-1/2 bg-[#e1e1e1]"></div>
					</div>
					<div className="mt-5 items-start justify-start">
						<div className="mb-5 pt-sans-regular">
							<TextField
								required
								fullWidth
								id="outlined-required"
								label="Name"
								variant="outlined"
								size="small"
							/>
						</div>
						<div className="mb-5">
							<TextField
								required
								fullWidth
								id="outlined-basic"
								label="Email"
								variant="outlined"
								size="small"
								type="email"
								autoComplete="email"
							/>
						</div>
						<div className="mb-5">
							<TextField
								required
								fullWidth
								id="outlined-basic"
								label="Password"
								variant="outlined"
								size="small"
								type="password"
								autoComplete="current-password"
							/>
						</div>
						<div>
							<Button fullWidth variant="contained">
								Contained
							</Button>
						</div>
					</div>
				</div>
				<div className=" inner-right-container h-full"></div>
			</div>
		</div>
	);
}

export default SignUp;
