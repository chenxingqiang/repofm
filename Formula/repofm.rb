class Repofm < Formula
  desc "Repository Management Tool for Efficient Code Workflows"
  homepage "https://github.com/chenxingqiang/repofm"
  url "https://github.com/chenxingqiang/repofm/archive/v2.0.4.tar.gz"
  sha256 "#{`shasum -a 256 /Users/xingqiangchen/TASK/repofm/repofm.tar.gz`.split[0]}"
  license "MIT"

  depends_on "node@18"
  depends_on "pnpm"

  def install
    system "pnpm", "install", "--frozen-lockfile"
    system "pnpm", "build"
    libexec.install Dir["*"]
    bin.install_symlink libexec/"bin/repofm.cjs" => "repofm"
  end

  test do
    system "#{bin}/repofm", "--version"
  end
end
