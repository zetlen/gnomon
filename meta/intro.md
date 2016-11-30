# gnomon

A command line utility, a bit like
[moreutils's **ts**](https://joeyh.name/code/moreutils/), to prepend timestamp
information to the standard output of another command. Useful for long-running
processes where you'd like a historical record of what's taking so long.

## Example

![basic](https://cloud.githubusercontent.com/assets/1643758/13685018/17b4f76c-e6d4-11e5-8838-40fa52346ae8.gif)

Piping anything to `gnomon` will prepend a timestamp to each line, indicating 
how long that line was the last line in the buffer--that is, how long it took
the next line to appear. By default, `gnomon` will display the seconds elapsed
between each line, but that is configurable.

You can display total time elapsed since the process began:
![total](https://cloud.githubusercontent.com/assets/1643758/13685020/199b78b2-e6d4-11e5-9083-05de6c52cc60.gif)

You can display an absolute timestamp:
![absolute](https://cloud.githubusercontent.com/assets/1643758/13685022/1ab3a5bc-e6d4-11e5-9ccf-3a5c68f9ea0c.gif)

You can also use the `--high` and/or `--medium` options to specify a length
threshold in seconds, over which `gnomon` will highlight the timestamp in red
or yellow. And you can do a few other things, too.

![fancy](https://cloud.githubusercontent.com/assets/1643758/13685025/1bbf6ad6-e6d4-11e5-8806-e90a6e852bf7.gif)

If the realtime timestamp updating is distracting or incompatible with your
terminal, it can be disabled:

![norealtime](https://cloud.githubusercontent.com/assets/1643758/13685027/1cfd823e-e6d4-11e5-9f90-c047d67a35e0.gif)
