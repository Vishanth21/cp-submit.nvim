local function submit_code()
	local uv = vim.uv or vim.loop

	-- file extension
	local file_ext = vim.fn.expand("%:e")

	-- read all lines of current buffer
	local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)

	-- join all lines to get code
	local file_content = table.concat(lines, "\n")

	-- pattern for site
	local pattern = [[\vhttps?://codeforces\.com/(problemset/problem|contest)/\d+/[A-Z0-9]+]]

	-- stores site url
	local site = nil

	for index = 1, #lines do
		local match = vim.fn.matchstr(lines[index], pattern)

		if match ~= "" then
			site = match
			break
		end
	end

	if not site then
		print("Error: url not found")
		return
	end

	local payload = {
		url = site,
		code = file_content,
		extension = file_ext,
	}

	local json_payload = vim.fn.json_encode(payload)

	local server = uv.new_tcp()
	local success, err = server:bind("127.0.0.1", 0)
	if not success then
		print("Failed to bind server: " .. err)
		return
	end

	local port = server:getsockname().port

	local function handle_connection(conn_err)
		if conn_err then
			print("Server Error: " .. conn_err)
			return
		end

		local client = uv.new_tcp()
		server:accept(client)

		client:read_start(function(read_err, chunk)
			if chunk and chunk:match("GET") then
				local response = "HTTP/1.1 200 OK\r\n"
					.. "Content-Type: application/json\r\n"
					.. "Access-Control-Allow-Origin: *\r\n"
					.. "Content-Length: "
					.. string.len(json_payload)
					.. "\r\n\r\n"
					.. json_payload

				client:write(response, function()
					client:close()
					server:close()
					vim.schedule(function()
						print("Submitting...")
					end)
				end)
			end
		end)
	end

	-- 1. Tell the server to start listening in the background
	server:listen(128, handle_connection)

	local trigger_url = "http://127.0.0.1:" .. port

	if vim.ui.open then
		vim.ui.open(trigger_url)
	else
		local os_name = uv.os_uname().sysname
		local cmd
		if os_name == "Linux" then
			cmd = "xdg-open"
		elseif os_name:match("Windows") then
			cmd = "start"
		elseif os_name == "Darwin" then -- macOS
			cmd = "open"
		end

		if cmd then
			vim.fn.jobstart({ cmd, trigger_url }, { detach = true })
		else
			print("Error: Failed to open browser")
		end
	end
end

vim.api.nvim_create_user_command("CPSubmit", submit_code, {})
