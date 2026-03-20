vim.api.nvim_create_user_command("CPSubmit", function()
	require("cp-submit").submit_code()
end, {})
