require("lib/luaunit")

TestLevel = {}

function TestLevel:testSuccess()
	assertEquals(3, 3)
end

function TestLevel:testFailure()
	assertEquals(3, 4)
end

LuaUnit:run()
