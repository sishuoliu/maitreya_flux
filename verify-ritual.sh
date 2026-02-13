#!/bin/bash

echo "=== 功德轮回游戏文件验证 ==="
echo ""

# 检查文件是否存在
echo "1. 检查文件..."
files=("ritual.html" "ritual-game.js" "ritual-index.html" "README_RITUAL.md" "RITUAL_PROJECT_REPORT.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file 存在"
    else
        echo "  ✗ $file 缺失"
    fi
done

echo ""
echo "2. 文件大小..."
ls -lh ritual.html ritual-game.js | awk '{print "  " $9 ": " $5}'

echo ""
echo "3. 代码行数..."
wc -l ritual.html ritual-game.js | tail -3

echo ""
echo "4. JavaScript语法检查..."
if node -c ritual-game.js 2>&1; then
    echo "  ✓ JavaScript语法正确"
else
    echo "  ✗ JavaScript语法错误"
fi

echo ""
echo "5. 检查关键函数..."
functions=("initGame" "performAction" "updateUI" "saveBeing" "endGame")
for func in "${functions[@]}"; do
    if grep -q "function $func" ritual-game.js; then
        echo "  ✓ $func() 已定义"
    else
        echo "  ✗ $func() 未找到"
    fi
done

echo ""
echo "6. 检查数据定义..."
data=("ROLES" "COLLECTIVE_EVENTS" "BEINGS" "VOWS")
for d in "${data[@]}"; do
    if grep -q "const $d" ritual-game.js; then
        echo "  ✓ $d 已定义"
    else
        echo "  ✗ $d 未找到"
    fi
done

echo ""
echo "7. Git提交历史..."
git log --oneline --grep="ritual" | head -5

echo ""
echo "=== 验证完成 ==="
echo ""
echo "游戏文件位置："
echo "  主游戏: $(pwd)/ritual.html"
echo "  说明页: $(pwd)/ritual-index.html"
echo ""
echo "使用方法："
echo "  在浏览器中打开 ritual-index.html 或 ritual.html"
